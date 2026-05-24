# Project Status Board & Adaptive Changelog

This journal tracks updates, bug fixes, features, and future roadmap items. Future agents must update this document whenever modifications are made to the codebase.

---

## 1. System Status
- **Current Version:** `1.0.8`
- **Last Sync Check:** May 23, 2026
- **Firebase Status:** Firestore and Storage configured, persistence enabled for offline coordination.

---

## 2. Chronological Log of Changes

### Version 1.0.8 (May 23, 2026) - Competitive Esports Revamp, Mistakes Log Upgrade & Quadruple Backups
* **Competitive Study Matchup Revamp:**
  - Designed Esports-VS split-half profile cards for Rudolph (👻) and Mahi (🦋) with neon leadership glows and crown overlays (`👑`) for the daily leader.
  - Implemented dual high-contrast Tug-of-War matchup progress bars: one for Daily Grind (today's hours) and one for Overall Campaign (total accumulated hours).
  - Added Opera-style corner stickers, a floating reaction burst toolbar (8 emojis), nudge notifications, and dual-grind synergy pulsing state triggers.
* **Interactive Mistakes Log Upgrade:**
  - Separated mistakes into `🔴 Undone Mistakes` and `🟢 Reviewed Mistakes` tabs.
  - Compressed log list elements to summary-only rows containing Subject Tag + Topic/Chapter.
  - Created a detailed mistake popup modal with a click-to-reveal rule overlay covering the actionable solution.
* **Central Web Audio Synthesizer:**
  - Integrated latency-free sound chimes for tab clicks, stopwatch clocking in/out, pomodoro timer alarms, checkbox completions, sticker pins, reactions, and nudges.
* **Bug Fixes & Chat heartbeats:**
  - Resolved Math HL vs SL scope bug in `getSubjectLabel(subject, user)` where Rudolph's active subject incorrectly showed as Math AA SL on Mahi's view.
  - Added a last online heartbeats timestamp below the partner's name in the Chat header for offline users.
  - Hidden the weekly study timetable navigation tab for Rudolph to clean up layout.
* **Automatic Safeguards, Backups & Recovery Utility:**
  - Added `hasLoadedUserData` load lock in `firebase-sync.js` to block database writes before profile data is verified, preventing race condition empty cache overwrites on startup.
  - Isolated reactions writes to targeted `.update({ liveReaction: ... })` instead of full-state document overrides.
  - Added automated cloud backups in `study_backups` collection and daily archives in `study_archives` collection.
  - Configured local storage backup mirroring (`BF_shifts_backup` and `GF_shifts_backup` saved on both devices).
  - Added a compact select dropdown in the Timesheet header to Export/Import JSON local backup files.
  - Created and updated [recover_mahi_shifts.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/recover_mahi_shifts.js) to recover study spent hours directly from browser local storage binary logs (Chrome, Edge, or Safari) on Windows or macOS, featuring recursive directory traversal and UTF-16LE binary database parsing.

### Version 1.0.7 (May 23, 2026) - Postponed CS HL Database Topics & Version Bump
* **Study Blueprint Adjustments:**
  - Added notes to Saturday, May 23 and Wednesday, May 27 CS HL tasks in [index.html](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/index.html) to move unfinished A3.2/A3.3 database topics to Wednesday's dedicated database block.
* **HTML Version Bump:**
  - Bumped version in [index.html](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/index.html) to `1.0.7` and updated stylesheet/script asset references.

### Version 1.0.6 (May 23, 2026) - Added AI Agent Study Guide & Topic Resolution Protocol
* **Study Guide Protocol:**
  - Created [.agents/study_guide.md](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/.agents/study_guide.md) to provide a concrete protocol for AI agents to answer topic/schedule queries using Revision Dojo Pro.
  - Documented subject-specific study workflows (Practice-Heavy, Concept-Dense, Case-Study) mapping directly to Dojo resources.
* **Blueprint Integration:**
  - Updated [.agents/blueprint.md](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/.agents/blueprint.md) to register the new `.agents` directory files in the Core File Registry.
* **HTML Version Bump:**
  - Bumped version in `index.html` to `1.0.6` and updated all stylesheet/script asset references to trigger the client update detector.

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

---

## 5. Lessons Learned & Recovery Post-Mortem

### Case Study: macOS Safari Local Storage Recovery (May 24, 2026)
* **The Issue:** Mahi's study shifts database on macOS Safari was cleared, and the initial copy-paste terminal script failed to recover it.
* **Root Cause 1: zsh Wildcard Globbing Error (`no matches found`):**
  On macOS, the default shell is `zsh`. In `zsh`, if a wildcard search (like `*.localstorage`) has zero matches in a directory, the shell aborts execution with `zsh: no matches found` *before* executing the command (even if output is redirected with `2>/dev/null`).
  - *Corrective Action:* Avoid shell globbing (`*`) in loops when searching directories that may not contain matches. Instead, use `find` (where the wildcard is quoted, e.g. `"-name" "*.localstorage"`) or zsh nullglob qualifiers like `*(N)` to prevent zsh from raising fatal expansion errors.
* **Root Cause 2: Modern Sandboxed Safari Directories:**
  Safari no longer stores local storage in `~/Library/Safari/LocalStorage/` on modern macOS. It is now hidden deep in sandboxed containers:
  `~/Library/Containers/com.apple.Safari/Data/Library/WebKit/WebsiteData/LocalStorage/`
  - *Corrective Action:* Expanded target folders in the Node.js recovery utility to search sandboxed WebKit containers recursively.
* **Root Cause 3: SQLite UTF-16LE Encoding:**
  WebKit stores LocalStorage key-value pairs as SQLite databases, but both keys and values are encoded in UTF-16LE (each ASCII character followed by a `\0` null byte). A standard binary scan for `"GF_shifts"` will fail unless it searches for the UTF-16LE buffer (`G\0F\0...\0`) and properly decodes the payload chunk from UTF-16LE to UTF-8 before parsing as JSON.
  - *Corrective Action:* Configured [recover_mahi_shifts.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/recover_mahi_shifts.js) to scan for both UTF-8 and UTF-16LE buffers, and decode matched chunks accordingly.
