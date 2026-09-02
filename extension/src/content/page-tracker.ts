(() => {
  const w = window as any;
  if (typeof window === 'undefined' || w.__sharedom_tracker_installed__) return;
  w.__sharedom_tracker_installed__ = true;

  const logsBuffer: Array<{ level: string; message: string; timestamp: number; count: number }> = [];
  const reqsBuffer: Array<any> = [];
  const MAX_LOGS = 200;
  const MAX_REQS = 150;

  function formatValue(v: unknown, depth = 0): string {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (v instanceof Error) {
      return v.stack || `${v.name}: ${v.message}`;
    }
    if (typeof v === 'object') {
      if (depth > 1) return Object.prototype.toString.call(v);
      try {
        if ('message' in (v as any) && 'name' in (v as any)) {
          return (v as any).stack || `${(v as any).name}: ${(v as any).message}`;
        }
        return JSON.stringify(v);
      } catch {
        return Object.prototype.toString.call(v);
      }
    }
    return String(v);
  }

  function formatConsoleArgs(args: unknown[]): string {
    if (!args || args.length === 0) return '';

    const first = args[0];
    if (typeof first === 'string' && first.includes('%c')) {
      let text = first.replace(/%c/g, '').trim();
      const extraArgs: unknown[] = [];
      for (let i = 1; i < args.length; i++) {
        const a = args[i];
        if (typeof a === 'string' && (a.includes(':') || a.includes('color') || a.includes('font') || a.includes('background'))) {
          continue;
        }
        extraArgs.push(a);
      }
      if (extraArgs.length > 0) {
        text += ' ' + extraArgs.map((a) => formatValue(a, 0)).join(' ');
      }
      return text;
    }

    return args.map((a) => formatValue(a, 0)).join(' ');
  }

  function recordLog(level: string, rawArgs: unknown[]): void {
    try {
      const message = formatConsoleArgs(rawArgs);
      if (!message && rawArgs.length === 0) return;

      const item = {
        level,
        message: message || `(${level})`,
        timestamp: Date.now(),
        count: 1,
      };

      const last = logsBuffer[logsBuffer.length - 1];
      if (last && last.level === level && last.message === item.message) {
        last.count = (last.count || 1) + 1;
        last.timestamp = item.timestamp;
      } else {
        if (logsBuffer.length >= MAX_LOGS) logsBuffer.shift();
        logsBuffer.push(item);
      }
    } catch {}
  }

  // Hook console with strict re-entrancy protection
  let isLogging = false;
  const methods = ['log', 'info', 'warn', 'error', 'debug', 'trace', 'dir', 'table'] as const;
  for (const method of methods) {
    const orig = (console as any)[method];
    if (typeof orig === 'function') {
      (console as any)[method] = function (...args: any[]) {
        if (!isLogging) {
          isLogging = true;
          try {
            const level = method === 'trace' ? 'debug' : (method === 'dir' || method === 'table' ? 'log' : method);
            recordLog(level, args);
          } catch {}
          finally {
            isLogging = false;
          }
        }
        try {
          return orig.apply(console, args);
        } catch {
          return orig(...args);
        }
      };
    }
  }

  window.addEventListener('error', (event: ErrorEvent) => {
    try {
      const err = event.error;
      const message = err
        ? (err.stack || `${err.name || 'Error'}: ${err.message || event.message}`)
        : (event.message || 'Script error');
      if (message) {
        recordLog('error', [message]);
      }
    } catch {}
  }, true);

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    try {
      const reason = event.reason;
      const message = reason instanceof Error
        ? (reason.stack || `${reason.name}: ${reason.message}`)
        : (typeof reason === 'object' && reason !== null ? JSON.stringify(reason) : String(reason));
      if (message) {
        recordLog('error', [`Unhandled Rejection: ${message}`]);
      }
    } catch {}
  }, true);

  function extractName(url: string): string {
    try {
      const u = new URL(url, window.location.href);
      return u.pathname + (u.search || '') || u.host || url;
    } catch {
      return url;
    }
  }

  function recordReq(req: any): void {
    try {
      if (reqsBuffer.length >= MAX_REQS) reqsBuffer.shift();
      reqsBuffer.push(req);
    } catch {}
  }

  let isFetching = false;
  if (typeof window.fetch === 'function') {
    const origFetch = window.fetch;
    window.fetch = function (this: any, ...args: any[]) {
      if (isFetching) {
        return origFetch.apply(this, args);
      }
      const start = performance.now();
      let url = '';
      let method = 'GET';
      try {
        const input = args[0];
        const init = args[1];
        url = typeof input === 'string'
          ? input
          : (input && (input as Request).url ? (input as Request).url : String(input));
        method = (init && init.method) || ((input as Request) && (input as Request).method) || 'GET';
      } catch {}

      return origFetch.apply(this, args).then((res) => {
        try {
          recordReq({
            method: method.toUpperCase(),
            url,
            name: extractName(url),
            status: res.status,
            statusText: res.statusText || (res.ok ? 'OK' : ''),
            type: 'fetch',
            duration: Math.round(performance.now() - start),
            timestamp: Date.now(),
          });
        } catch {}
        return res;
      }).catch((err) => {
        try {
          recordReq({
            method: method.toUpperCase(),
            url,
            name: extractName(url),
            status: 0,
            statusText: 'Failed',
            type: 'fetch',
            duration: Math.round(performance.now() - start),
            timestamp: Date.now(),
          });
        } catch {}
        throw err;
      });
    };
  }

  if (typeof XMLHttpRequest !== 'undefined') {
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest & { __sh_method?: string; __sh_url?: string },
      method: string,
      url: string | URL,
      ...rest: any[]
    ) {
      try {
        this.__sh_method = method;
        this.__sh_url = typeof url === 'string' ? url : (url && (url as URL).href ? (url as URL).href : String(url));
      } catch {}
      return (origOpen as any).apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (
      this: XMLHttpRequest & { __sh_method?: string; __sh_url?: string },
      ...args: any[]
    ) {
      const self = this;
      const start = performance.now();
      try {
        this.addEventListener('loadend', () => {
          try {
            recordReq({
              method: (self.__sh_method || 'GET').toUpperCase(),
              url: self.__sh_url || '',
              name: extractName(self.__sh_url || ''),
              status: self.status,
              statusText: self.statusText,
              type: 'xhr',
              duration: Math.round(performance.now() - start),
              timestamp: Date.now(),
            });
          } catch {}
        }, { once: true });
      } catch {}
      return origSend.apply(this, args);
    };
  }

  // Respond cleanly only when requested by extension
  window.addEventListener('__sharedom_request_sync__', () => {
    try {
      const payload = JSON.stringify({ logs: logsBuffer, reqs: reqsBuffer });
      window.dispatchEvent(new CustomEvent('__sharedom_sync_response__', {
        detail: payload,
      }));
    } catch {}
  });
})();
