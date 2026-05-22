# Project Status Board & Adaptive Changelog

This journal tracks updates, bug fixes, features, and future roadmap items. Future agents must update this document whenever modifications are made to the codebase.

---

## 1. System Status
- **Current Version:** `1.0.3`
- **Last Sync Check:** May 22, 2026
- **Firebase Status:** Firestore and Storage configured, persistence enabled for offline coordination.

---

## 2. Chronological Log of Changes

### Version 1.0.3 (May 22, 2026) - Codebase Re-architecture to Modular Vanilla Structure
* **Codebase Splitting:**
  - Split [style.css](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/css/style.css) into separate component stylesheets: [chat.css](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/css/components/chat.css), [timers.css](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/css/components/timers.css), and [mistakes.css](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/css/components/mistakes.css).
  - Split [app.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/app.js) by moving component-specific logic to [timers.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/components/timers.js), [countdown.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/components/countdown.js), [mistakes-log.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/components/mistakes-log.js), and [chat.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/components/chat.js).
* **HTML Integration:**
  - Integrated the modular CSS and JS components into [index.html](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/index.html) with correct dependency loading orders.
  - Bumped all style and script links with `?v=1.0.3` query parameters for cache-busting.
* **Documentation & Contracts:**
  - Updated [blueprint.md](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/.agents/blueprint.md) core file registry to document the new modular layout.
  - Added a new contract requiring every update, release, or bugfix to be committed and pushed to GitHub immediately.

### Version 1.0.2 (May 22, 2026) - Centered Toast & Optimistic Updates
* **Centered Update Toast:**
  - Repositioned update toast from bottom-sliding bar to centered pop-up modal.
  - Added full-screen overlay backdrop (`blur(12px)`) that darkens the app and blocks click events until updated.
  - Set text to: *"A new version of the Website is available!"*.
* **Light/Dark Theme Adaptability:**
  - Added variables inside [themes.css](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/css/themes.css) (`--toast-bg`, `--toast-border`, `--toast-shadow`, etc.) to automatically color the modal based on the active layout.
  - Revamped chat trigger buttons to use theme hover states (`--chat-btn-hover`).
* **Optimistic Chat Sends:**
  - Updated [chat.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/chat.js) with `pendingMessages` array.
  - Messages sent locally immediately render on screen at `0.6` opacity with a `⏳` status, and update to full opacity on successful Firestore receipt.
  - Restores the typed text back into the chat text field if the network fails.

### Version 1.0.1 (May 22, 2026) - Chat Redesign & Top Controls Integration
* **Header Controls Migration:**
  - Relocated chat widget trigger button (`#chat-trigger-btn`) to the top-controls navigation bar directly on the left of the theme toggle.
  - Added responsive rules that hide button text and collapse them into emoji-only icon buttons (`[💬] [🌙] [👤]`) on small screen widths (`< 600px`).
* **Visual Styling Revamp:**
  - Set up dynamic, glassmorphic dropdown layout for the chat window sliding down from the top control bar.
  - Restyled chat bubbles to match individual user colors (Cyan-blue for Rudolph/BF, Coral-pink for Mahi/GF) with distinct alignments.

### Version 1.0.0 (May 21, 2026) - Mistakes Log Image Support & Initial Chat Release
* **Mistakes Log Photos:**
  - Integrated Drag-and-drop, paste-to-upload, and file selector inputs for mistake log entries.
  - Configured upload to Firebase Storage bucket.
  - Added lightbox modal viewer for image enlargement in [index.html](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/index.html).
* **Initial Chat Release:**
  - Added floating chat trigger button and slide-in notifications.

---

## 3. Future Roadmap
- [ ] Add sound toggle indicators directly on top controls.
- [ ] Add archive filters in the Mistakes Log list.
- [ ] Integrate weekly performance graphs/statistics on timer logs.

---

## 4. Agent Guidelines for Journal Updates
> [!IMPORTANT]
> **Update Protocol:**
> Whenever you complete a task:
> 1. Bump the patch version in `index.html` (e.g. `1.0.2` -> `1.0.3`) if code changes were made to styles or scripts.
> 2. Add an entry under **Chronological Log of Changes** describing the version, date, and items modified.
> 3. Verify that all links are active and point to correct file schemes.
