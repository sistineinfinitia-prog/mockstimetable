# Mocks Study Wrapped - Study Plan & Telemetry Catalog

This document outlines the roadmap for the **Study Wrapped** launch on **June 12th, 2026**, along with a detailed directory of every single metric currently being tracked in the database to build the final slide deck.

---

## 📅 Roadmap & Launch Plan

### Phase 1: Telemetry & Data Collection (Current Phase)
* **Goal**: Collect rich data for Rudolph (`BF`) and Mahi (`GF`) over the next two weeks.
* **Status**: Complete! The Firestore schemas and front-end scripts have been updated to log chat counts, nudges, Pomodoros, check-ins, and shifts.

### Phase 2: Slide Deck UI & Animation Design (Early June)
* **Goal**: Build the visuals for the Wrapped stories.
* **Design Guidelines**:
  * Vibrant dark mode backgrounds using HSL gradients matching subject themes (e.g., green for CS, red/orange for chemistry).
  * Smooth CSS transitions (sliding/fading animations like Instagram Stories).
  * Web Audio API synthesized chimes for slide changes.
  * A downloadable **Summary Card** at the end.

### Phase 3: Lock Screen & Countdown
* **Goal**: Prevent early access while allowing development previews.
* **Mechanism**: A lock screen overlay that displays a countdown timer until June 12th, 2026.
* **Bypass**: Accessing the URL with a query parameter (e.g., `?preview=true`) will unlock the Wrapped early for testing.

### Phase 4: Launch Day (June 12th)
* **Goal**: Celebrate exam completion!
* **Action**: The lock screen automatically falls away on June 12th, unlocking the interactive Wrapped for both profiles.

---

## 📊 Complete Telemetry Catalog (What is Tracked)

Below is the exhaustive list of all metrics being tracked in Firestore, split by feature area, and what slides they will generate.

### I. Study Sessions & Style (Logged in `shifts`)
Every time a user clocks out of a study session, a shift is logged: `{ date: ISOString, subject: String, duration: Number (mins) }`.

* **1. Total Time Studied**
  * *Calculation*: Sum of all shift durations.
  * *Slide*: Shows individual study hours and a combined grand total of your joint effort.
* **2. Top Subject (The Champion)**
  * *Calculation*: Sum of durations grouped by subject.
  * *Slide*: Displays your most-studied subject with custom themed colors.
* **3. Study Style: "Sprinter" vs. "Marathoner"**
  * *Calculation*: Ratio of short sessions (<45 mins) to long grinds (>90 mins).
  * *Slide*: Labels your study style based on session profiles.
* **4. Subject Juggler vs. Monogamist**
  * *Calculation*: The average number of unique subjects studied per day.
  * *Slide*: Reveals if you focus on one subject a day or bounce between many.
* **5. Early Bird vs. Night Owl**
  * *Calculation*: Shifts grouped by hour of day (Morning: 5 AM-12 PM, Afternoon: 12 PM-6 PM, Evening: 6 PM-12 AM, Night: 12 AM-5 AM).
  * *Slide*: Tells you what time of day you are most active.
* **6. Peak Study Day**
  * *Calculation*: The single calendar date with the highest sum of durations.
  * *Slide*: Celebrates your most intense study day (e.g., *"On May 28th, you studied for a massive 7.5 hours!"*).
* **7. The Marathon Session**
  * *Calculation*: The single shift with the longest duration.
  * *Slide*: Showcases your longest single stretch of continuous focus.
* **8. False Alarms (Accidental Starts)**
  * *Calculation*: Count of shifts with a duration $\le 2$ minutes.
  * *Slide*: A humorous callout of how many times you clicked "Clock In" and immediately backed out.
* **9. The Monday Blues**
  * *Calculation*: Grouping shift durations by day-of-week to find the lowest average.
  * *Slide*: Highlights which day of the week was your hardest to start.
* **10. Weekend Warrior vs. Weekday Scholar**
  * *Calculation*: Ratio of weekday study hours vs. weekend study hours.
  * *Slide*: Compares your weekday habits to your weekend grinds.

---

### II. Focus Timer Stats (Logged in `pomosCompleted`)
Every time a Pomodoro work block completes, it logs: `{ timestamp: Number, duration: Number, type: String, subject: String }`.

* **11. Total Focus Blocks Conquered**
  * *Calculation*: Count of objects in the `pomosCompleted` array.
  * *Slide*: Showcases the total number of successful Pomodoro cycles run.
* **12. Pomodoro Style**
  * *Calculation*: Comparison of completed `work-50` (50m blocks) vs. `work-25` (25m blocks).
  * *Slide*: Identifies whether you prefer the 50-minute marathon or the 25-minute sprint.

---

### III. Daily Checklist & Syllabus (Logged in `blueprintTasks` & `blueprintCheckboxes`)
Checked off blueprint tasks for Mahi, and checkbox IDs for Rudolph.

* **13. Blueprint Milestones Completed**
  * *Calculation*: Sum of checked-off syllabus checklist items.
  * *Slide*: Celebrates total tasks crossed off and your overall syllabus completion percentage.

---

### IV. Mistakes Log (Logged in `mistakes`)
Each logged mistake holds: `{ subject, topic, desc, action, resolved: Boolean, imageUrl: String }`.

* **14. Mistakes Identified vs. Resolved**
  * *Calculation*: Count of total mistakes vs. count of mistakes marked `resolved: true`.
  * *Slide*: Highlights how many conceptual gaps you successfully reviewed and fixed.
* **15. Toughest Subject (Error Champion)**
  * *Calculation*: Grouping mistakes by subject.
  * *Slide*: Points out which subject gave you the most trouble.
* **16. Visual Learner vs. Textual Purist**
  * *Calculation*: The percentage of mistakes that contain screenshot attachments (`imageUrl`).
  * *Slide*: Humorous comparison of Rudolph’s visual screenshots vs. Mahi’s text-only notes.

---

### V. Chat & Communication (Logged in `chat` and `totalChatMessagesSent`)
Real-time chat logging and a persistent message counter.

* **17. Total Messages Exchanged**
  * *Calculation*: Cumulative sum of the new `totalChatMessagesSent` profile values.
  * *Slide*: The grand total of messages typed to coordinate, complain, and encourage.
* **18. Who Talks More?**
  * *Calculation*: Ratio of Rudolph's total chats vs. Mahi's total chats.
  * *Slide*: Displays who was the chatterbox and who was the listener.
* **19. Chat Response Speed (Ghoster vs. Speed Responder)**
  * *Calculation*: Average time difference between a partner's message and your reply.
  * *Slide*: Playfully labels one of you a *Speed Responder* and the other a *Ghoster*.
* **20. Signature Chat Words**
  * *Calculation*: Standard string cleaning and word frequency count of your chat history.
  * *Slide*: Shows the word you both typed the most (excluding common words).
* **21. Peak Chat Hour**
  * *Calculation*: Message counts grouped by hour of day.
  * *Slide*: The hour when your conversation was at its peak.

---

### VI. Partner Dynamics & Portal Checks (Logged in user profiles)
Telemetry tracking live nudges, stickers, and page visits.

* **22. The Sticker War Champion**
  * *Calculation*: Total stickers pinned (extracted from sticker activity logs).
  * *Slide*: Showcases who pinned more stickers on whom, and what emoji was the favorite weapon.
* **23. The Nudge Spammer**
  * *Calculation*: Running total of clicks on the nudge `🔔` button (from `nudgesSent`).
  * *Slide*: Calls out who spammed the nudge button the most to wake up the other.
* **24. Total Reactions Sent**
  * *Calculation*: Running total of motivational emojis sent (from `reactionsSent`).
  * *Slide*: Counts the total encouragement emojis thrown across the screen.
* **25. Synchronized Study Dates**
  * *Calculation*: Overlapping timestamps where both users were clocked in at the same time.
  * *Slide*: Celebrates the total hours you spent studying *together* in real-time.
* **26. Synchronized Streaks**
  * *Calculation*: Overlapping dates where both users maintained a study streak.
  * *Slide*: Celebrates consecutive days where both of you stayed committed together.
* **27. Portal Check-Ins (App Visits)**
  * *Calculation*: Running total of page loads logged in `visitCount`.
  * *Slide*: Tells you exactly how many times you opened the mock study portal.
