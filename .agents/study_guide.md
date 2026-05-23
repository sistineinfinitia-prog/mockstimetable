# AI Agent Study Guide & Topic Query Resolution Protocol

This document instructs AI agents on how to respond to user requests regarding what topics they should study for a given subject or day. Whenever the user asks *"what topic in subject xxx should I be studying for this day z"* or similar questions, follow this protocol.

---

## 1. Context Resolution Flow

When a query is received, resolve the context by following these steps:

1. **Identify the Student:** 
   - **Always assume the user is Rudolph (BF).** He is the sole user interacting with you in this workspace.
   - Rudolph's subjects: **Math AA HL, Physics HL, CS HL, Spanish B SL, Business SL, English SL**.

2. **Determine the Target Date/Day:**
   - If Rudolph specifies a day (e.g., "Monday", "Mon", "May 25"), map it to the schedule.
   - If Rudolph says "today" or "tomorrow", retrieve the current date from the system's local time metadata and map it (e.g., if today is Saturday, May 23, then "today" = Saturday/Sat, "tomorrow" = Sunday/Sun).

3. **Locate Schedule Content in Codebase:**
   - **Timetable Cells:** Read the weekly timetable structures in [js/firebase-sync.js](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/js/firebase-sync.js) (`window.defaultTimetableBF`) or [index.html](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/index.html) to see the scheduled blocks (Morning, Afternoon, Evening).
   - **Blueprint Tasks:** Look up specific dates and tasks in [index.html](file:///c:/Users/Rudolph/Documents/mocks%20study%20plan/index.html) (under `#bf-timeline-view` / `#blueprint-content-bf`).

---

## 2. Subject-Specific Revision Dojo Pro Dashboards & Workflows

When recommending steps in a study plan, **only recommend the Revision Dojo Pro tools that are actually available for that specific subject.** Reference the mapping below to construct your step-by-step checklists:

### 📐 Mathematics Analysis & Approaches HL (Math AA HL)
*Available Dojo Tools:*
- **Learn:** `Notes` *(note: called "Notes" instead of "Textbooks")*, `Videos`, `Teach Jojo`, `Lessons`, `Flashcards`, `Key Definitions`
- **Practice:** `Questionbank`, `Exam builder`, `Predicted Papers`, `Past Papers` *(video walkthroughs)*, `Exercises` *(concept videos & practice questions)*
*Recommended Workflow Checklist:*
1.  **Formula & Mistakes Review:** Open the IB Formula Booklet and review the Mistakes Log.
2.  **Concept Check:** Use **[Notes]**, **[Videos]**, or **[Lessons]** to patch gaps.
3.  **Active Explaining:** Explain key ideas using **[Teach Jojo]**.
4.  **Topical Question Drilling:** Solve questions in the **[Questionbank]** (using the 3-step Study Debugging Protocol).
5.  **Timed Exam Practice:** Use **[Exam builder]**, **[Predicted Papers]**, or **[Past Papers]** video walkthroughs.
*Calculator Tip:* Use EQUA mode (F4: Solver) or GRAPH mode (F5: G-Solv) on the Casio `fx-CG50`.

### 🌌 Physics HL
*Available Dojo Tools:*
- **Learn:** `Textbooks`, `Videos`, `Teach Jojo`, `Lessons`, `Flashcards`, `Cheatsheets`, `Key Definitions`
- **Practice:** `Questionbank`, `Exam builder`, `Predicted Papers`, `Past Papers` *(video walkthroughs)*
*Recommended Workflow Checklist:*
1.  **Quick Cheatsheet Review:** Review summary cards in **[Cheatsheets]** or review past mistakes in the Mistakes Log.
2.  **Visual Explainer:** Watch tricky derivations/concepts using **[Videos]** or read **[Textbooks]**.
3.  **Active Recall:** Test formulas/concepts with **[Flashcards]** or teach Jojo using **[Teach Jojo]**.
4.  **Problem Drilling:** Work through topical problems in the **[Questionbank]**.
5.  **Mock Simulation:** Build short custom tests in the **[Exam builder]** or solve **[Predicted Papers]**.

### 💻 Computer Science HL (CS HL)
*Available Dojo Tools:*
- **Learn:** `Textbooks`, `Teach Jojo`, `Lessons`, `Flashcards`, `Key Definitions`
- **Practice:** `Questionbank`, `Exam builder`
- *Note:* Do NOT recommend "Videos", "Cheatsheets", "Predicted Papers", or "Past Papers" for CS HL as they do not exist on the CS dashboard.
*Recommended Workflow Checklist:*
1.  **Theory Study:** Study algorithmic traces, data structures, or database theory in **[Textbooks]** or **[Lessons]**.
2.  **Vocabulary/Term Drilling:** Active recall of definitions using **[Key Definitions]** and **[Flashcards]** (e.g., Primary/Foreign keys, Stack/Queue rules).
3.  **Feynman Teaching:** Teach Jojo algorithms or data structures using **[Teach Jojo]**.
4.  **Dry Runs & Code Practice:** Solve trace tables and query structures in the **[Questionbank]**.

### 🇪🇸 Spanish B SL
*Available Dojo Tools:*
- **Learn:** `Textbooks`, `Lessons`, `Key Definitions`
- **Practice:** `Questionbank`, `Vocabulary Practice`, `Exam builder`, `Essay Marker`, `Exercises` *(grammar, vocab, listening with skill questions)*
- *Note:* Do NOT recommend "Teach Jojo", "Flashcards", "Videos", "Cheatsheets", or "Predicted Papers" for Spanish B SL.
*Recommended Workflow Checklist:*
1.  **Vocabulary & Grammar Drills:** Spend 20m on **[Vocabulary Practice]** or grammar worksheets in **[Exercises]**.
2.  **Format Review:** Read text layout guidelines (Blog, Diario, Correo, Artículo) in **[Textbooks]** or **[Lessons]**.
3.  **Writing Practice:** Write a short response and paste it into the **[Essay Marker]** for instant feedback.
4.  **Listening/Reading Practice:** Solve past-paper sections in the **[Questionbank]** or **[Exam builder]**.

### 💼 Business Management SL
*Available Dojo Tools:*
- **Learn:** `Textbooks`, `Teach Jojo`, `Lessons`, `Flashcards`, `Cheatsheets`, `Key Definitions`
- **Practice:** `Questionbank`, `Exam builder`, `Essay Marker`, `Predicted Papers`
*Recommended Workflow Checklist:*
1.  **Summary Review:** Read core concepts in **[Cheatsheets]** or **[Key Definitions]**.
2.  **Concept Mapping:** Read case study principles in **[Textbooks]** or follow **[Lessons]**.
3.  **Active Recall:** Practice terms on **[Flashcards]** or test yourself with **[Teach Jojo]**.
4.  **Essay Outline Practice:** Draft mock structures and score them using the **[Essay Marker]**.
5.  **Timed Practice:** Drill case questions in the **[Questionbank]** or try **[Predicted Papers]**.

### 🇬🇧 English A Lang & Lit SL
*Available Dojo Tools:*
- **Learn:** `Textbooks`, `Lessons`, `Literary Texts` *(specifically for Paper 2 prescribed texts)*, `Cheatsheets`, `Key Definitions`
- **Practice:** `Questionbank`, `Exam builder`, `Essay Marker`, `Predicted Papers`
*Recommended Workflow Checklist:*
1.  **Visual Analysis Review:** Study infographic layouts, visual appeals, and styling features in **[Cheatsheets]** or **[Lessons]**.
2.  **Paper 2 Quote Check:** Review quotes/themes for Gatsby/Kite Runner in **[Literary Texts]**.
3.  **Essay Writing:** Write a comparative thesis outline or a PEEL body paragraph, and evaluate it using the **[Essay Marker]**.
4.  **Exam Conditioning:** Solve P1/P2 mocks using **[Predicted Papers]** or custom tests via the **[Exam builder]**.

---

## 3. Response Generation Guidelines

When presenting the study plan:
1.  **Response Structure:** Use a step-by-step checklist matching the user's preferred format.
2.  **Explicit Timings:** Add realistic timing suggestions (e.g. "30 mins") for each step.
3.  **Specific Exclusions:** Highlight the exclusions or focuses defined in your blueprint (e.g., Business SL: exclude budgeting/investment appraisal; Math AA HL: exclude kinematics, permutations & combinations, and integration for this mock cycle).
4.  **Dojo Tool Links:** Explicitly label the tool (e.g. `**[Vocabulary Practice]**`, `**[Notes]**`, etc.) so Rudolph knows exactly where to click.

---

## 4. Example Output Template

Use this format when answering a study topic query:

### 📅 Study Guidance: [Subject] — [Day/Date]
**Active Profile:** Rudolph (BF)
**Scheduled Block:** [Morning / Afternoon / Evening]
**Core Topic:** [e.g., CS HL: Database Theory & SQL Joins]

#### 📝 Step-by-Step Study Checklist (Revision Dojo Pro)

*   [ ] **[Textbooks / Lessons]** Read *Chapter 12: Database Management Systems* and complete the *SQL Joins* lesson. (25 mins)
*   [ ] **[Key Definitions]** Review database keys (Primary, Foreign, Composite) and normalisation rules. (15 mins)
*   [ ] **[Teach Jojo]** Teach Jojo how to normalize a table from 1NF to 3NF to confirm your understanding. (15 mins)
*   [ ] **[Questionbank]** Solve 5 database query questions focusing on `INNER JOIN` and `LEFT JOIN`. (30 mins)
    *   *Tip:* Remember the database leak prep focus: practice compound conditions (`GROUP BY/HAVING`) and nested subqueries.

> [!TIP]
> Remember to click "Clock In ⚡" on the dashboard before starting, and log any wrong questions in the "Mistakes Log" right after you grade them!
