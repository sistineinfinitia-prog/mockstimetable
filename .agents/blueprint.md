# Core Codebase Blueprint & System Contracts

This file serves as a reference blueprint for AI coding assistants. Read this before modifying the codebase to prevent regressions, maintain design integrity, and understand database structures.

---

## 1. Architectural Philosophy & Technology Stack
- **Philosophy:** Highly responsive, premium aesthetic (glassmorphism, vibrant soft accents) for joint study revision.
- **Stack:** Pure Vanilla HTML5, CSS3, and ES6 Javascript.
- **Framework Constraint:** No TailwindCSS, React, or build systems. Keep files raw and direct.
- **Cache-Busting Contract:** Every time a new update is released, the version meta tag in `index.html` (e.g. `<meta name="version" content="1.0.3">`) and stylesheet references (`href="css/style.css?v=1.0.3"`) must be bumped to trigger the client-side update detector.

---

## 2. Core File Registry
- [index.html](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/index.html): Houses layouts, widgets, structural tables, and overlays (Mistakes Image Lightbox, Centered Update Toast Modal, and Study Chat Widget).
- [css/themes.css](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/css/themes.css): The theme system container. Defines `:root` (Dark Theme) and `[data-theme="light"]` (Light Theme) variables. 
- [css/style.css](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/css/style.css): Core container grids, layout boxes, responsive page wrappers, header settings, and default button themes.
- [css/components/](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/css/components/):
  - [chat.css](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/css/components/chat.css): CSS styles for the study chat widget, bubble UI, input area, and notification toast.
  - [timers.css](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/css/components/timers.css): CSS styles for clock-in/out, stopwatch, and Pomodoro timer dashboard card.
  - [mistakes.css](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/css/components/mistakes.css): CSS styles for the mistakes log form, drag-and-drop file upload, list cards, filters, and lightbox.
- [js/firebase-sync.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/firebase-sync.js): Handles Firestore database initialization, user session synchronization, offline state caching, and the default datasets for BF (Rudolph) and GF (Mahi).
- [js/components/](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/components/):
  - [chat.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/components/chat.js): Manages the real-time chat UI, unread badge alerts, audio notifications, and optimistic UI updates.
  - [timers.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/components/timers.js): Merged module for the live clock updater, active session stopwatch, and Pomodoro timer event listeners and logic.
  - [countdown.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/components/countdown.js): Countdown timer calculations and display updates.
  - [mistakes-log.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/components/mistakes-log.js): Handles mistakes logs rendering, past-paper filters, image upload compression, drag-and-drop / paste image attachment, and the lightbox zoom view.
- [js/app.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/app.js): Handles application routing, tab navigation, global updates checker, active shift session trackers, and general window hooks.
- [recover_mahi_shifts.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/recover_mahi_shifts.js): LevelDB & SQLite utility scanner to recover study spent hours directly from Safari, Chrome, or Edge browser cache binary logs on Windows or macOS.
- [.agents/](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/.agents/):
  - [blueprint.md](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/.agents/blueprint.md): Core blueprint reference file for AI coding assistants.
  - [journal.md](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/.agents/journal.md): Changelog journal and roadmap tracking.
  - [study_guide.md](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/.agents/study_guide.md): AI Agent study guidance protocol for resolving study topics and schedules leveraging Revision Dojo Pro.

---

## 3. Database & Sync Schemas (Firestore / Firebase Storage)

### Firestore Collection: `study_data`

#### Document: `chat`
Stores the recent chat history between users:
```typescript
interface ChatSchema {
  messages: Array<{
    sender: 'BF' | 'GF';
    text: string;
    timestamp: number; // Unix epoch milliseconds
  }>;
}
```
*Note: The array is limited to the last 200 messages to prevent document size growth.*

#### Document: `timetable`
Synchronizes the study timetable between sessions:
```typescript
interface TimetableSchema {
  // Keyed by user identifier: BF or GF
  [userCode: string]: {
    [day: string]: { // "Mon", "Tue", etc.
      morning: string;
      afternoon: string;
      evening: string;
    }
  }
}
```

#### Document: `mistakes`
Contains mistakes logged by the students:
```typescript
interface MistakesSchema {
  mistakes: Array<{
    id: string; // unique ID
    sender: 'BF' | 'GF';
    subject: string; // "math", "physics", "cs", etc.
    question: string; // Text description
    error: string; // The mistake made
    correction: string; // Correct method
    timestamp: number;
    imageUrl?: string; // Optional Firebase Storage download URL
  }>;
}
```

#### Documents: `dashboard` and `gf_dashboard`
Stores the active state, study plan checklist progress, logged shifts, and competitive stats for Rudolph (BF) and Mahi (GF):
```typescript
interface DashboardSchema {
  agenda: Array<any>;
  shifts: Array<{
    subject: string;
    duration: number; // minutes spent
    date: string; // ISO timestamp
  }>;
  activeSession: null | {
    subject: string;
    startTime: number;
  };
  timetable: any;
  blueprintCheckboxes: { [taskId: string]: boolean };
  mistakes: Array<any>;
  blueprintTasks: Array<any>;
  pinnedStickers: Array<{
    emoji: string;
    sender: 'BF' | 'GF';
    timestamp: number;
  }>;
  grindStreak: number;
  lastStudyDate: string;
  liveReaction: null | {
    emoji: string;
    timestamp: number;
  };
  tasksVersion: number;
  lastActive: number;
}
```

### Firestore Collection: `study_backups`
Contains duplicate copies of shifts arrays to protect against empty desync writes. Updated only when local shifts list is non-empty.
*   **Documents:** `dashboard_backup` (BF) and `gf_dashboard_backup` (GF)
```typescript
interface BackupSchema {
  shifts: Array<any>;
  lastBackup: number;
}
```

### Firestore Collection: `study_archives`
Contains permanent, daily-stamped historical backup snapshots of logged study hours.
*   **Documents:** `${user}_shifts_archive_${YYYY-MM-DD}` (e.g. `GF_shifts_archive_2026-05-23`)
```typescript
interface ArchiveSchema {
  shifts: Array<any>;
  timestamp: number;
}
```

---

## 4. UI Style Guide & Coding Contracts

### Theme Consistency
Never use hardcoded hex values or rgba colors for basic panels/buttons/texts. Always use the theme-aware tokens defined in `themes.css`:
- Background color: `var(--bg-color)`
- Card panels: `var(--card-bg)`, `var(--card-border)`
- Primary text: `var(--text-main)`, secondary text: `var(--text-muted)`
- Accent colors for subjects: `var(--math-color)`, `var(--physics-color)`, etc.

### Glassmorphism Card Style
All containers should feel light and transparent:
```css
background: var(--card-bg);
border: 1px solid var(--card-border);
backdrop-filter: blur(15px);
-webkit-backdrop-filter: blur(15px);
```

### Agent Instruction Checklist
> [!IMPORTANT]
> **Adaptive Documentation Updates:**
> Whenever you modify files in this repository, you **MUST** update `.agents/journal.md` with:
> 1. The timestamp and version code of your update.
> 2. A concise summary of the changes you made.
> 3. Any new guidelines or changes to files and DB schemas inside this `blueprint.md` file.
> 4. **GitHub Version Control & Sync Contract:** Every update, release, or bugfix must be committed and pushed to GitHub immediately to ensure synchronization across team members.
