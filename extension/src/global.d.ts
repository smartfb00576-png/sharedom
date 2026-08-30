/// <reference types="chrome" />

export interface FetchImageMessage {
  type: 'SHAREDOM_FETCH_IMAGE';
  url: string;
}

export interface StartInspectorMessage {
  type: 'START_INSPECTOR';
  options?: {
    scale?: number;
    format?: 'png' | 'jpeg' | 'webp';
    language?: 'en' | 'es';
  };
}

export interface StopInspectorMessage {
  type: 'STOP_INSPECTOR';
}

export interface ToggleInspectorMessage {
  type: 'TOGGLE_INSPECTOR';
  options?: {
    scale?: number;
    format?: 'png' | 'jpeg' | 'webp';
    language?: 'en' | 'es';
  };
}

export interface GetInspectorStatusMessage {
  type: 'GET_INSPECTOR_STATUS';
}

export type ExtensionMessage =
  | FetchImageMessage
  | StartInspectorMessage
  | StopInspectorMessage
  | ToggleInspectorMessage
  | GetInspectorStatusMessage;
