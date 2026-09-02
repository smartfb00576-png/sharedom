# Chrome Web Store Listing & Submission Guide

*Last Updated: 2026-08-30*

This document contains all official store metadata, permission justifications, privacy disclosures, and step-by-step instructions for publishing `sharedom` to the **Chrome Web Store**.

---

## 1. Store Listing Details

- **Item Name**: `ShareDOM - DOM Screenshot Inspector`
- **Summary / Short Description** (≤ 132 chars):
  `Inspect, select, and capture high-quality screenshots of any DOM element with live preview, copy to clipboard, and instant download.`
- **Category**: `Developer Tools`
- **Primary Language**: `English (United States)`
- **Support / Homepage URL**: `https://github.com/Erickgiber/sharedom`

### Detailed Description (Copy & Paste)

```text
sharedom is a fast, lightweight developer tool that allows you to inspect and capture clean, high-resolution screenshots of any DOM element directly from your browser.

✨ Key Features:
• 🎯 Interactive DOM Inspector: Hover over any card, banner, container, or component on any webpage to see real-time bounding box highlights, tag names, CSS classes, and exact pixel dimensions.
• ⌨️ Full Keyboard Navigation: Traverse parent containers with [↑ Up Arrow] and child elements with [↓ Down Arrow], and capture instantly with [Enter] or [Space].
• 📋 Copy to Clipboard: Copy high-fidelity PNG image data directly to your system clipboard (via native Clipboard API) to paste immediately into Figma, Slack, Notion, GitHub issues, Discord, or documentation.
• 💾 High-Resolution Export: Capture at 1x, 2x (Retina HD), or 3x (Ultra HD) resolution in PNG (with alpha transparency), JPEG, or WebP.
• 📄 Instant PDF Document Export: Directly export captured DOM components into clean, self-contained PDF documents with configurable metadata and page sizes.
• 🎨 Automatic Background Detection: Automatically detects and applies the computed background color of dark or themed elements, with full manual override options (Transparent, White, Dark, or Custom).
• 🌐 Bicultural & Multilingual: One-click instant switching between English and Spanish.
• 🛡️ Shadow DOM Isolation: All extension overlays and controls run in an isolated Shadow DOM container and never conflict with website stylesheets or appear in captured images.
• ⚡ 100% Client-Side & Private: Zero telemetry, zero tracking, and zero external analytics.
```

---

## 2. Permissions Justification (Required for Store Review)

When submitting, Chrome Web Store reviewers require a plain-English explanation for every permission requested:

| Permission | Justification for Review Team |
| :--- | :--- |
| `activeTab` | Required to inspect and capture DOM elements on the active webpage only upon explicit user invocation (clicking the toolbar action, pressing the shortcut Alt+Shift+S, or selecting the context menu item). |
| `scripting` | Required to dynamically inject the isolated inspection content script into the active tab upon user trigger. |
| `storage` | Required to save user default preferences locally (default resolution scale, preferred image format, language choice) in chrome.storage.local. |
| `contextMenus` | Required to provide a "Inspect & Capture DOM Element" option when right-clicking on elements. |

---

## 3. Privacy & Data Handling Declarations

- **Privacy Policy URL**: `https://erickgiber.github.io/sharedom/#/privacy` (or `https://erickgiber.github.io/sharedom/privacy.html`)
- **Single Purpose**: `A developer utility to inspect and capture screenshots of DOM elements on web pages.`
- **Data Collection**: `None. The extension does not collect, store, or transmit any user data, personal info, authentication credentials, or browsing history.`
- **Remote Code**: `None. All code is statically bundled and runs locally in the browser.`
- **Third-Party Services**: `No third-party trackers, analytics, or external API endpoints are used.`

---

## 4. Visual Assets Checklist

- **Store Icon**: `extension/icons/icon-128.png` (128×128px PNG).
- **Screenshots**: At least 1 screenshot at `1280×800px` or `640×400px` (showing the DOM inspector highlighting an element and the action modal open).
- **Small Promo Tile** (Optional): `440×280px`.
- **Marquee Promo Tile** (Optional): `1400×560px`.

---

## 5. Step-by-Step Submission Process

### Step 1: Package the Extension
Run the automated packaging script from the repository root:
```bash
npm run zip:extension
```
This generates `sharedom-extension.zip`.

### Step 2: Open Chrome Developer Dashboard
1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with your Google account.
3. If this is your first time, pay the one-time \$5 USD developer registration fee.

### Step 3: Upload the Package

#### A. If updating an EXISTING extension in the store:
1. In your [Developer Dashboard](https://chrome.google.com/webstore/devconsole), click on your extension: **"ShareDOM - DOM Screenshot Inspector"**.
2. In the left sidebar, click on **"Package"** (Paquete).
3. Click the **"Upload new package"** (Subir nuevo paquete) button.
4. Drag and drop `sharedom-extension.zip` or select it from your project root.
5. Verify that the dashboard detects version `1.1.0`.

#### B. If publishing for the FIRST time:
1. Click **"New Item"** (Nuevo elemento) at the top right of the dashboard.
2. Drag and drop `sharedom-extension.zip`.
3. Fill out the Store Listing, Privacy, and Distribution sections using the metadata in Sections 1-3 above.

### Step 4: Submit for Review
1. Review your changes (optionally add release notes in the dashboard).
2. Click **"Submit for review"** (Enviar para revisión).
3. The review process typically takes between **24 and 72 hours**. Once approved, Chrome will automatically update all existing users to version 1.1.0!
