/* js/app.js */

document.addEventListener('DOMContentLoaded', () => {
    // Escape HTML helper
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Helper to get subject labels dynamically based on current user
    function getSubjectLabel(sub, user = window.currentUser) {
        const bfLabels = {
            math: 'Math AA HL',
            physics: 'Physics HL',
            cs: 'Computer Science HL',
            span: 'Spanish B SL',
            bus: 'Business SL',
            eng: 'English Lang Lit SL'
        };
        const gfLabels = {
            econ: 'Economics HL',
            bio: 'Biology HL',
            chem: 'Chemistry HL',
            eng: 'English Lang Lit SL',
            span: 'Spanish ab initio',
            math: 'Math AA SL'
        };
        if (user === 'GF') {
            return gfLabels[sub] || sub;
        }
        return bfLabels[sub] || sub;
    }
    window.getSubjectLabel = getSubjectLabel;

    // Dynamic dropdown updates based on profile
    function populateSubjectDropdowns() {
        const shiftSubjectSelect = document.getElementById('shift-subject');
        const mistakeSubjectSelect = document.getElementById('mistake-subject');
        const filterMistakeSubject = document.getElementById('filter-mistake-subject');

        const bfSubjects = [
            { value: 'math', text: 'Math AA HL' },
            { value: 'physics', text: 'Physics HL' },
            { value: 'cs', text: 'Computer Science HL' },
            { value: 'span', text: 'Spanish B SL' },
            { value: 'bus', text: 'Business SL' },
            { value: 'eng', text: 'English Lang Lit SL' }
        ];

        const gfSubjects = [
            { value: 'econ', text: 'Economics HL' },
            { value: 'bio', text: 'Biology HL' },
            { value: 'chem', text: 'Chemistry HL' },
            { value: 'eng', text: 'English Lang Lit SL' },
            { value: 'span', text: 'Spanish ab initio' },
            { value: 'math', text: 'Math AA SL' }
        ];

        const activeSubjects = (window.currentUser === 'GF') ? gfSubjects : bfSubjects;

        // Populate Shift clock dropdown
        shiftSubjectSelect.innerHTML = activeSubjects.map(s => 
            `<option value="${s.value}">${s.text}</option>`
        ).join('');

        // Populate Mistakes entry dropdown
        mistakeSubjectSelect.innerHTML = activeSubjects.map(s => 
            `<option value="${s.value}">${s.text}</option>`
        ).join('');

        // Populate Mistakes filter dropdown
        filterMistakeSubject.innerHTML = `
            <option value="all">🔍 Show All Subjects</option>
            ${activeSubjects.map(s => `<option value="${s.value}">${s.text}</option>`).join('')}
        `;
    }

    // 1. Dynamic Encouragement Advice Banner Updates
    function updateDynamicStatus() {
        const statusText = document.getElementById('dynamic-status-text');
        if (!statusText) return;

        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timeVal = hours + minutes / 60;

        if (window.currentUser === 'GF') {
            // GF Study Hours: 10:00 AM to 7:30 PM grind
            if (timeVal >= 10 && timeVal < 13) {
                statusText.innerHTML = "⚡ <strong>Morning Focus:</strong> Lock in! Run focused study blocks (like 70-min Pomodoro rounds). Keep hydrated.";
            } else if (timeVal >= 13 && timeVal < 17) {
                statusText.innerHTML = "☕ <strong>Afternoon Progress:</strong> Halfway done. Drill past paper questions and log conceptual mistakes immediately!";
            } else if (timeVal >= 17 && timeVal < 19.5) {
                statusText.innerHTML = "🏁 <strong>Final Shift:</strong> Work day is winding down. Clear today's checklist goals. You got this!";
            } else if (timeVal >= 19.5 && timeVal < 22) {
                statusText.innerHTML = "✨ <strong>Guilt-Free Rest Time!</strong> Your 7:30 PM stop time has passed. Shut the books, relax, and chill.";
            } else {
                statusText.innerHTML = "😴 <strong>Bedtime Wind-down:</strong> Sleep early! Sleeping properly is when your brain locks in everything you studied today.";
            }
        } else {
            // BF (Rudolph) Study Hours: 8:00 AM to 8:30 PM grind
            if (timeVal >= 8 && timeVal < 12) {
                statusText.innerHTML = "⚡ <strong>Morning Grind:</strong> Stay focused! Work for 50 minutes, then take a strict 10-minute break. Keep active recall high!";
            } else if (timeVal >= 12 && timeVal < 17) {
                statusText.innerHTML = "☕ <strong>Afternoon Push:</strong> You are halfway through. Do topical past papers and verify using the mark scheme!";
            } else if (timeVal >= 17 && timeVal < 20.5) {
                statusText.innerHTML = "🏁 <strong>Finishing Strong:</strong> Wrapping up soon. Wrap up your active recall sessions. Almost time to relax!";
            } else if (timeVal >= 20.5 && timeVal < 22.5) {
                statusText.innerHTML = "🎮 <strong>Guilt-Free Rest Time!</strong> Study leave hours are over. Put away the files, game, text Mahi, and relax with zero guilt!";
            } else {
                statusText.innerHTML = "😴 <strong>Bedtime Alert:</strong> Wind down. Turn off screens. Sleep consolidates what you learned today!";
            }
        }
    }

    setInterval(updateDynamicStatus, 60000);
    updateDynamicStatus();

    // 2. Tab Navigation System
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    function switchTab(tabId) {
        if (typeof window.playInteractionSound === 'function') window.playInteractionSound('tab');
        window.currentPickerType = null; // Close any picker panels on navigation
        if (typeof window.renderCompetitionWidget === 'function') {
            window.renderCompetitionWidget();
        }

        tabButtons.forEach(b => {
            if (b.getAttribute('data-tab') === tabId) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
        tabContents.forEach(c => {
            if (c.id === `tab-${tabId}`) {
                c.classList.add('active');
            } else {
                c.classList.remove('active');
            }
        });
    }

    // Date boundaries helpers for auto-selecting active phase
    function getDefaultBfPhase(date) {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed: 4 = May, 5 = June
        const day = date.getDate();
        
        // Phase 1: up to May 22, 2026
        // Phase 2: May 23 - May 31, 2026
        // Phase 3: June 1 - June 12, 2026
        if (year < 2026 || (year === 2026 && month < 4) || (year === 2026 && month === 4 && day <= 22)) {
            return 'phase1';
        } else if (year === 2026 && month === 4 && day >= 23 && day <= 31) {
            return 'phase2';
        } else {
            return 'phase3';
        }
    }

    function getDefaultMahiPhase(date) {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed: 4 = May, 5 = June
        const day = date.getDate();
        
        // Study Leave: up to June 4, 2026
        // Mock Exams: June 5 - June 12, 2026
        if (year < 2026 || (year === 2026 && month < 5) || (year === 2026 && month === 5 && day <= 4)) {
            return 'Study Leave';
        } else {
            return 'Mock Exams';
        }
    }

    // Sub-tab Navigation (Timesheet)
    const timesheetBtnSummary = document.getElementById('timesheet-btn-summary');
    const timesheetBtnHistory = document.getElementById('timesheet-btn-history');
    const timesheetTabSummaryContent = document.getElementById('timesheet-tab-summary-content');
    const timesheetTabHistoryContent = document.getElementById('timesheet-tab-history-content');

    function switchTimesheetTab(tabId) {
        if (!timesheetBtnSummary || !timesheetBtnHistory || !timesheetTabSummaryContent || !timesheetTabHistoryContent) return;

        if (tabId === 'summary') {
            timesheetBtnSummary.classList.add('active');
            timesheetBtnHistory.classList.remove('active');
            timesheetTabSummaryContent.classList.add('active');
            timesheetTabHistoryContent.classList.remove('active');
        } else {
            timesheetBtnSummary.classList.remove('active');
            timesheetBtnHistory.classList.add('active');
            timesheetTabSummaryContent.classList.remove('active');
            timesheetTabHistoryContent.classList.add('active');
        }
        if (window.currentUser) {
            localStorage.setItem(window.currentUser + '_active_timesheet_tab', tabId);
        }
    }

    if (timesheetBtnSummary && timesheetBtnHistory) {
        timesheetBtnSummary.addEventListener('click', () => switchTimesheetTab('summary'));
        timesheetBtnHistory.addEventListener('click', () => switchTimesheetTab('history'));
    }

    // Sub-tab Navigation (Blueprint)
    const blueprintBtnStrategy = document.getElementById('blueprint-btn-strategy');
    const blueprintBtnTimeline = document.getElementById('blueprint-btn-timeline');
    const bfStrategyView = document.getElementById('bf-strategy-view');
    const bfTimelineView = document.getElementById('bf-timeline-view');
    const mahiStrategyView = document.getElementById('mahi-strategy-view');
    const mahiTimelineView = document.getElementById('mahi-timeline-view');

    function switchBlueprintTab(tabId) {
        if (!blueprintBtnStrategy || !blueprintBtnTimeline) return;

        if (tabId === 'strategy') {
            blueprintBtnStrategy.classList.add('active');
            blueprintBtnTimeline.classList.remove('active');
            
            if (bfStrategyView) bfStrategyView.classList.add('active');
            if (bfTimelineView) bfTimelineView.classList.remove('active');
            if (mahiStrategyView) mahiStrategyView.classList.add('active');
            if (mahiTimelineView) mahiTimelineView.classList.remove('active');
        } else {
            blueprintBtnStrategy.classList.remove('active');
            blueprintBtnTimeline.classList.add('active');
            
            if (bfStrategyView) bfStrategyView.classList.remove('active');
            if (bfTimelineView) bfTimelineView.classList.add('active');
            if (mahiStrategyView) mahiStrategyView.classList.remove('active');
            if (mahiTimelineView) mahiTimelineView.classList.add('active');
        }
        if (window.currentUser) {
            localStorage.setItem(window.currentUser + '_active_blueprint_tab', tabId);
        }
    }

    if (blueprintBtnStrategy && blueprintBtnTimeline) {
        blueprintBtnStrategy.addEventListener('click', () => switchBlueprintTab('strategy'));
        blueprintBtnTimeline.addEventListener('click', () => switchBlueprintTab('timeline'));
    }

    // Rudolph BF Phase Switcher
    window.switchBfPhase = function(phaseId) {
        const pills = ['all', 'phase1', 'phase2', 'phase3'];
        pills.forEach(p => {
            const pillEl = document.getElementById(`bf-pill-${p}`);
            if (pillEl) {
                if (p === phaseId) {
                    pillEl.classList.add('active');
                } else {
                    pillEl.classList.remove('active');
                }
            }
        });

        const containers = {
            phase1: document.getElementById('bf-phase1-container'),
            phase2: document.getElementById('bf-phase2-container'),
            phase3: document.getElementById('bf-phase3-container')
        };

        Object.keys(containers).forEach(key => {
            const container = containers[key];
            if (container) {
                if (phaseId === 'all' || phaseId === key) {
                    container.style.display = 'block';
                } else {
                    container.style.display = 'none';
                }
            }
        });

        localStorage.setItem('BF_active_phase_filter', phaseId);
    };

    // Mahi GF Phase Switcher
    window.switchMahiPhase = function(phaseName) {
        const pills = {
            'All': document.getElementById('mahi-pill-all'),
            'Study Leave': document.getElementById('mahi-pill-leave'),
            'Mock Exams': document.getElementById('mahi-pill-exams')
        };

        Object.keys(pills).forEach(key => {
            const pillEl = pills[key];
            if (pillEl) {
                if (key === phaseName) {
                    pillEl.classList.add('active');
                } else {
                    pillEl.classList.remove('active');
                }
            }
        });

        window.currentMahiPhaseFilter = phaseName;
        localStorage.setItem('GF_active_phase_filter', phaseName);
        renderMahiBlueprint();
    };

    // Theme Switcher Logic (White/Black, Eye-safe theme)
    function getSystemTheme() {
        const hour = new Date().getHours();
        return (hour >= 7 && hour < 19) ? 'light' : 'dark';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mocks_theme', theme);
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.innerHTML = theme === 'light' ? '🌙 <span class="btn-text">Light/Dark Mode</span>' : '☀️ <span class="btn-text">Light/Dark Mode</span>';
            themeBtn.title = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        }
    }

    window.toggleTheme = function() {
        document.documentElement.classList.add('theme-transition');
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 800);
    };

    // Initialize Theme
    const savedTheme = localStorage.getItem('mocks_theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(getSystemTheme());
    }

    // 3. User Selection Portal Methods
    window.selectPortalUser = function(user) {
        window.currentUser = user;
        document.getElementById('user-portal').classList.add('fade-out');
        localStorage.setItem('mocks_study_plan_current_user', user);
        document.documentElement.setAttribute('data-user', user);
        
        // Restore active sub-tabs preference
        const activeTimesheetTab = localStorage.getItem(user + '_active_timesheet_tab') || 'summary';
        switchTimesheetTab(activeTimesheetTab);

        const activeBlueprintTab = localStorage.getItem(user + '_active_blueprint_tab') || 'strategy';
        switchBlueprintTab(activeBlueprintTab);

        // Restore active phase filter preference based on user and date
        if (user === 'GF') {
            let activePhase = localStorage.getItem('GF_active_phase_filter');
            if (!activePhase) {
                activePhase = getDefaultMahiPhase(new Date());
            }
            switchMahiPhase(activePhase);
        } else {
            let activePhase = localStorage.getItem('BF_active_phase_filter');
            if (!activePhase) {
                activePhase = getDefaultBfPhase(new Date());
            }
            window.switchBfPhase(activePhase);
        }

        // Apply profile details
        const profileBtn = document.getElementById('profile-switcher-btn');
        profileBtn.innerHTML = '👤 Change Profile';
        if (user === 'GF') {
            document.getElementById('hero-title').innerText = "Mahi's Study Timetable";
            
            // Hide Timetable button
            document.querySelector('[data-tab="timetable"]').style.display = 'none';
            // Switch away from timetable if active
            const activeTabBtn = document.querySelector('.tab-btn.active');
            if (activeTabBtn && activeTabBtn.getAttribute('data-tab') === 'timetable') {
                switchTab('desk');
            }

            // Blueprint views
            document.getElementById('blueprint-content-bf').style.display = 'none';
            document.getElementById('blueprint-content-mahi').style.display = 'block';
        } else {
            document.getElementById('hero-title').innerText = "Road to 42";

            // Hide Timetable button for Rudolph as well
            document.querySelector('[data-tab="timetable"]').style.display = 'none';
            // Switch away from timetable if active
            const activeTabBtn = document.querySelector('.tab-btn.active');
            if (activeTabBtn && activeTabBtn.getAttribute('data-tab') === 'timetable') {
                switchTab('desk');
            }

            // Blueprint views
            document.getElementById('blueprint-content-bf').style.display = 'block';
            document.getElementById('blueprint-content-mahi').style.display = 'none';
        }

        // Dynamically adjust inputs
        populateSubjectDropdowns();
        
        // Refresh dynamic status banner times
        updateDynamicStatus();

        // Load correct DB
        window.loadUserData(user);
        
        // Update countdown targets
        if (typeof window.updateCountdown === 'function') {
            window.updateCountdown();
        }
    };

    window.showUserPortal = function() {
        document.getElementById('user-portal').classList.remove('fade-out');
    };


    // Study Console Inner Tab Switcher System
    const consoleBtnShift = document.getElementById('console-btn-shift');
    const consoleBtnPomo = document.getElementById('console-btn-pomo');
    const consoleTabShiftContent = document.getElementById('console-tab-shift-content');
    const consoleTabPomoContent = document.getElementById('console-tab-pomo-content');

    function switchConsoleTab(tabId) {
        if (tabId === 'shift') {
            consoleBtnShift.classList.add('active');
            consoleBtnPomo.classList.remove('active');
            consoleTabShiftContent.classList.add('active');
            consoleTabPomoContent.classList.remove('active');
        } else {
            consoleBtnShift.classList.remove('active');
            consoleBtnPomo.classList.add('active');
            consoleTabShiftContent.classList.remove('active');
            consoleTabPomoContent.classList.add('active');
        }
    }

    if (consoleBtnShift && consoleBtnPomo) {
        consoleBtnShift.addEventListener('click', () => switchConsoleTab('shift'));
        consoleBtnPomo.addEventListener('click', () => switchConsoleTab('pomo'));
    }


    // 5. Shift Clocking panel
    const statTodayEl = document.getElementById('stat-today');
    const statTotalEl = document.getElementById('stat-total');
    const shiftsLogList = document.getElementById('shifts-log-list');

    function saveShifts() {
        const storagePrefix = window.currentUser + '_';
        localStorage.setItem(storagePrefix + 'shifts', JSON.stringify(window.shifts));
        window.pushStateToFirestore();
    }

    function updateAnalytics() {
        let totalMins = 0;
        let todayMins = 0;
        const todayStr = new Date().toDateString();
        const subjectTotals = {};
        
        // Initialize active subject lists
        const activeSubjects = (window.currentUser === 'GF') ? [
            'econ', 'bio', 'chem', 'eng', 'span', 'math'
        ] : [
            'math', 'physics', 'cs', 'span', 'bus', 'eng'
        ];
        
        activeSubjects.forEach(s => {
            subjectTotals[s] = 0;
        });
        
        window.shifts.forEach(s => {
            totalMins += s.duration;
            if (new Date(s.date).toDateString() === todayStr) {
                todayMins += s.duration;
            }
            if (subjectTotals[s.subject] !== undefined) {
                subjectTotals[s.subject] += s.duration;
            } else {
                subjectTotals[s.subject] = s.duration;
            }
        });
        
        statTodayEl.innerText = (todayMins / 60).toFixed(1) + 'h';
        statTotalEl.innerText = (totalMins / 60).toFixed(1) + 'h';
        
        // Render Subject Breakdown List
        const breakdownList = document.getElementById('subject-breakdown-list');
        if (breakdownList) {
            let maxMins = 0;
            Object.values(subjectTotals).forEach(m => {
                if (m > maxMins) maxMins = m;
            });
            
            let html = '<h4 style="margin: 1rem 0 0.5rem 0; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">⏱️ Subject Breakdown</h4>';
            html += '<div class="subject-breakdown-grid" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">';
            
            activeSubjects.forEach(sub => {
                const mins = subjectTotals[sub] || 0;
                const hours = (mins / 60).toFixed(1);
                const pct = maxMins > 0 ? (mins / maxMins) * 100 : 0;
                
                html += `
                    <div class="subject-stat-row" style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
                        <span style="font-weight: 600; width: 140px; flex-shrink: 0;" class="shifts-log-subject ${sub}">${getSubjectLabel(sub)}</span>
                        <div class="subject-stat-bar-track" style="flex-grow: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; margin: 0 1rem; overflow: hidden; border: 1px solid rgba(255,255,255,0.03);">
                            <div class="subject-stat-bar" style="width: ${pct}%; height: 100%; border-radius: 4px; background-color: var(--${sub}-color); transition: width 0.5s ease-out;"></div>
                        </div>
                        <span style="font-weight: 700; width: 40px; text-align: right; color: var(--text-main);">${hours}h</span>
                    </div>
                `;
            });
            
            html += '</div>';
            breakdownList.innerHTML = html;
        }
        
        // Calculate and push streak updates
        calculateStreak();
        const storagePrefix = window.currentUser + '_';
        const oldStreak = parseInt(localStorage.getItem(storagePrefix + 'grind_streak')) || 0;
        if (window.grindStreak !== oldStreak) {
            localStorage.setItem(storagePrefix + 'grind_streak', window.grindStreak);
            localStorage.setItem(storagePrefix + 'last_study_date', window.lastStudyDate);
            window.pushStateToFirestore();
        }
    }

    function renderShifts() {
        shiftsLogList.innerHTML = '';
        if (window.shifts.length === 0) {
            shiftsLogList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 1rem 0;">No shifts logged yet. Clock in to start!</div>`;
            return;
        }
        
        const sortedShifts = [...window.shifts].sort((a,b) => new Date(b.date) - new Date(a.date));
        
        shiftsLogList.innerHTML = sortedShifts.map((s) => {
            const d = new Date(s.date);
            const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            return `
                <div class="shifts-log-item" style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex-grow: 1;">
                        <span class="shifts-log-subject ${s.subject}">${getSubjectLabel(s.subject)}</span>
                        <div class="shifts-log-date">${dateStr}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="shifts-log-duration" style="font-weight: 600; color: var(--exam-color);">${s.duration} min</div>
                        <button class="delete-shift-btn" onclick="deleteShiftByDate('${s.date}')" title="Delete Session">✕</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.deleteShiftByDate = function(dateStr) {
        if (window.isUpdatingFromFirestore) return;
        if (!confirm("Are you sure you want to delete this study session?")) return;
        
        const index = window.shifts.findIndex(s => s.date === dateStr);
        if (index !== -1) {
            window.shifts.splice(index, 1);
            saveShifts();
            updateAnalytics();
            renderShifts();
        }
    };

    window.renderCompetitionWidget = function() {
        const comparisonPanel = document.getElementById('study-comparison-panel');
        if (!comparisonPanel) return;
        
        const stats = window.competitionStats;
        const bf = stats['BF'] || { today: 0, total: 0, active: false, subject: '', pinnedStickers: [], grindStreak: 0 };
        const gf = stats['GF'] || { today: 0, total: 0, active: false, subject: '', pinnedStickers: [], grindStreak: 0 };
        
        const bfActiveSubject = bf.active && bf.subject ? `Studying ${getSubjectLabel(bf.subject, 'BF')} ⚡` : '💤 Off the Clock';
        const gfActiveSubject = gf.active && gf.subject ? `Studying ${getSubjectLabel(gf.subject, 'GF')} ⚡` : '💤 Off the Clock';
        
        // Determine leaders
        const bfLeader = bf.today > gf.today;
        const gfLeader = gf.today > bf.today;
        const isTied = bf.today === gf.today;
        
        // Co-Grind Synergy Mode Check
        const synergy = bf.active && gf.active;
        if (synergy) {
            comparisonPanel.classList.add('synergy-active');
        } else {
            comparisonPanel.classList.remove('synergy-active');
        }
        
        // Tug of War calculation
        const todaySum = bf.today + gf.today;
        const ratio = todaySum > 0 ? (bf.today / todaySum) * 100 : 50;
        
        let leadText = '';
        if (bfLeader) {
            leadText = `👻 Rudolph leads by ${(bf.today - gf.today).toFixed(1)}h today!`;
        } else if (gfLeader) {
            leadText = `🦋 Mahi leads by ${(gf.today - bf.today).toFixed(1)}h today!`;
        } else {
            leadText = `⚖️ Scores are tied today!`;
        }

        // Overall Tug of War calculation
        const totalSum = bf.total + gf.total;
        const totalRatio = totalSum > 0 ? (bf.total / totalSum) * 100 : 50;
        
        let totalLeadText = '';
        if (bf.total > gf.total) {
            totalLeadText = `👻 Rudolph leads by ${(bf.total - gf.total).toFixed(1)}h overall!`;
        } else if (gf.total > bf.total) {
            totalLeadText = `🦋 Mahi leads by ${(gf.total - bf.total).toFixed(1)}h overall!`;
        } else {
            totalLeadText = `⚖️ Campaign scores are tied overall!`;
        }

        // Extracted first pinned sticker details
        const bfSticker = bf.pinnedStickers && bf.pinnedStickers.length > 0 ? bf.pinnedStickers[0] : null;
        const gfSticker = gf.pinnedStickers && gf.pinnedStickers.length > 0 ? gf.pinnedStickers[0] : null;

        const bfStickerHtml = bfSticker ? `
            <div class="sticker-corner-badge" title="${bfSticker.sender === 'GF' ? 'Mahi' : 'Rudolph'} pinned this on ${new Date(bfSticker.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}">
                ${bfSticker.emoji}
            </div>` : '';

        const gfStickerHtml = gfSticker ? `
            <div class="sticker-corner-badge" title="${gfSticker.sender === 'GF' ? 'Mahi' : 'Rudolph'} pinned this on ${new Date(gfSticker.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}">
                ${gfSticker.emoji}
            </div>` : '';

        // Streaks counters
        const bfStreakText = bf.grindStreak > 0 ? `🔥 ${bf.grindStreak}d` : '❄️ 0d';
        const gfStreakText = gf.grindStreak > 0 ? `🔥 ${gf.grindStreak}d` : '❄️ 0d';

        // Check if pickers are active
        const reactionPickerOpen = window.currentPickerType === 'reaction';
        const stickerPickerOpen = window.currentPickerType === 'sticker';

        comparisonPanel.innerHTML = `
            <h3 style="color: var(--exam-color); font-family: 'Outfit'; font-size: 1.2rem; margin-top: 0; margin-bottom: 1.2rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
                ${synergy ? '🔥 DUAL GRIND ACTIVE 🔥' : '⚔️ Study Matchup'}
            </h3>
            
            <!-- Esports VS Grid -->
            <div class="comparison-statuses-esport">
                <!-- Rudolph (BF) Card -->
                <div class="matchup-card ${bfLeader ? 'leader bf-glow' : (isTied ? '' : 'dimmed')}">
                    ${bfLeader ? '<span class="avatar-crown">👑</span>' : ''}
                    <div class="avatar-container ${bf.active ? 'active' : ''}">
                        <div class="matchup-avatar">👻</div>
                        ${bfStickerHtml}
                    </div>
                    <div style="font-weight: 700; font-family: 'Outfit'; font-size: 0.95rem; color: #70a1ff;">Rudolph</div>
                    <span class="comparison-status-badge ${bf.active ? 'active' : 'offline'}" style="margin: 0.3rem 0;">
                        ${bfActiveSubject}
                    </span>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: bold; margin-top: 0.1rem;">
                        Streak: ${bfStreakText}
                    </div>
                </div>
                
                <!-- Central VS skew badge -->
                <div class="matchup-vs-badge">VS</div>
                
                <!-- Mahi (GF) Card -->
                <div class="matchup-card ${gfLeader ? 'leader gf-glow' : (isTied ? '' : 'dimmed')}">
                    ${gfLeader ? '<span class="avatar-crown">👑</span>' : ''}
                    <div class="avatar-container ${gf.active ? 'active' : ''}">
                        <div class="matchup-avatar">🦋</div>
                        ${gfStickerHtml}
                    </div>
                    <div style="font-weight: 700; font-family: 'Outfit'; font-size: 0.95rem; color: #ff6b81;">Mahi</div>
                    <span class="comparison-status-badge ${gf.active ? 'active' : 'offline'}" style="margin: 0.3rem 0;">
                        ${gfActiveSubject}
                    </span>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: bold; margin-top: 0.1rem;">
                        Streak: ${gfStreakText}
                    </div>
                </div>
            </div>
            
            <!-- Daily Tug-of-War battle bar -->
            <div class="tug-of-war-container">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.4rem;">
                    <span>Daily Grind Matchup</span>
                    <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: bold;">
                        ${bf.today.toFixed(1)}h vs ${gf.today.toFixed(1)}h
                    </span>
                </div>
                <div class="tug-of-war-bar">
                    <div class="tug-of-war-bf" style="width: ${ratio}%;"></div>
                    <div class="tug-of-war-gf" style="width: ${100 - ratio}%;"></div>
                    <div class="tug-of-war-pointer" style="left: ${ratio}%;">${synergy ? '⚡' : '🔥'}</div>
                </div>
                <div style="font-size: 0.75rem; text-align: center; margin-top: 0.4rem; color: var(--exam-color); font-weight: bold; letter-spacing: 0.3px;">
                    ${leadText}
                </div>
            </div>

            <!-- Overall Tug-of-War battle bar -->
            <div class="tug-of-war-container" style="margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.4rem;">
                    <span>Overall Campaign Matchup</span>
                    <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: bold;">
                        ${bf.total.toFixed(1)}h vs ${gf.total.toFixed(1)}h
                    </span>
                </div>
                <div class="tug-of-war-bar">
                    <div class="tug-of-war-bf" style="width: ${totalRatio}%;"></div>
                    <div class="tug-of-war-gf" style="width: ${100 - totalRatio}%;"></div>
                    <div class="tug-of-war-pointer" style="left: ${totalRatio}%; background: #2bcbba; box-shadow: 0 0 10px #2bcbba, 0 0 20px #0fbcf9;">🏆</div>
                </div>
                <div style="font-size: 0.75rem; text-align: center; margin-top: 0.4rem; color: #2bcbba; font-weight: bold; letter-spacing: 0.3px;">
                    ${totalLeadText}
                </div>
            </div>
            
            <!-- Interaction action toolbar -->
            <div class="matchup-toolbar" style="position: relative;">
                <button class="matchup-btn" onclick="window.togglePicker('reaction')">🚀 React</button>
                <button class="matchup-btn" onclick="window.togglePicker('sticker')">📌 Pin Sticker</button>
                <button class="matchup-btn" onclick="window.sendNudgeToPartner()">🔔 Nudge</button>
                
                <!-- Reaction Picker Popover overlay -->
                ${reactionPickerOpen ? `
                <div class="reaction-picker-overlay">
                    <span class="picker-emoji" onclick="window.sendReactionToPartner('🔥')">🔥</span>
                    <span class="picker-emoji" onclick="window.sendReactionToPartner('💤')">💤</span>
                    <span class="picker-emoji" onclick="window.sendReactionToPartner('👑')">👑</span>
                    <span class="picker-emoji" onclick="window.sendReactionToPartner('💀')">💀</span>
                    <span class="picker-emoji" onclick="window.sendReactionToPartner('🧠')">🧠</span>
                    <span class="picker-emoji" onclick="window.sendReactionToPartner('⚡')">⚡</span>
                    <span class="picker-emoji" onclick="window.sendReactionToPartner('🎯')">🎯</span>
                    <span class="picker-emoji" onclick="window.sendReactionToPartner('💖')">💖</span>
                </div>` : ''}
                
                <!-- Sticker Picker Popover overlay -->
                ${stickerPickerOpen ? `
                <div class="sticker-picker-overlay">
                    <span class="picker-emoji" onclick="window.pinStickerOnPartner('🔥')">🔥</span>
                    <span class="picker-emoji" onclick="window.pinStickerOnPartner('💤')">💤</span>
                    <span class="picker-emoji" onclick="window.pinStickerOnPartner('👑')">👑</span>
                    <span class="picker-emoji" onclick="window.pinStickerOnPartner('💀')">💀</span>
                    <span class="picker-emoji" onclick="window.pinStickerOnPartner('🧠')">🧠</span>
                    <span class="picker-emoji" onclick="window.pinStickerOnPartner('⚡')">⚡</span>
                    <span class="picker-emoji" onclick="window.pinStickerOnPartner('🎯')">🎯</span>
                    <span class="picker-emoji" onclick="window.pinStickerOnPartner('💖')">💖</span>
                </div>` : ''}
            </div>
        `;
    };




    // 6. Timetable Cells Double-Click Editor (Rudolph BF only)
    const timetableBody = document.getElementById('timetable-body');

    function saveTimetable() {
        const storagePrefix = window.currentUser + '_';
        localStorage.setItem(storagePrefix + 'timetable', JSON.stringify(window.timetable));
        window.pushStateToFirestore();
    }

    const dayNames = {
        "Mon": "Monday",
        "Tue": "Tuesday",
        "Wed": "Wednesday",
        "Thu": "Thursday",
        "Fri": "Friday",
        "Sat": "Saturday",
        "Sun": "Sunday"
    };

    function renderTimetable() {
        if (window.currentUser === 'GF') {
            timetableBody.innerHTML = '';
            return;
        }

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        timetableBody.innerHTML = '';
        
        days.forEach(day => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="timetable-day-col">${dayNames[day]}</td>
                <td class="timetable-cell" data-day="${day}" data-slot="morning">
                    <div class="timetable-cell-content">${escapeHtml(window.timetable[day]?.morning || '')}</div>
                    <textarea class="timetable-cell-edit">${window.timetable[day]?.morning || ''}</textarea>
                    <span class="timetable-cell-hint">Double-click to edit</span>
                </td>
                <td class="timetable-cell" data-day="${day}" data-slot="afternoon">
                    <div class="timetable-cell-content">${escapeHtml(window.timetable[day]?.afternoon || '')}</div>
                    <textarea class="timetable-cell-edit">${window.timetable[day]?.afternoon || ''}</textarea>
                    <span class="timetable-cell-hint">Double-click to edit</span>
                </td>
                <td class="timetable-cell" data-day="${day}" data-slot="evening">
                    <div class="timetable-cell-content">${escapeHtml(window.timetable[day]?.evening || '')}</div>
                    <textarea class="timetable-cell-edit">${window.timetable[day]?.evening || ''}</textarea>
                    <span class="timetable-cell-hint">Double-click to edit</span>
                </td>
            `;
            
            timetableBody.appendChild(row);
        });
        
        const cells = timetableBody.querySelectorAll('.timetable-cell');
        cells.forEach(cell => {
            const contentDiv = cell.querySelector('.timetable-cell-content');
            const textEdit = cell.querySelector('.timetable-cell-edit');
            const day = cell.getAttribute('data-day');
            const slot = cell.getAttribute('data-slot');
            
            function startEditing() {
                if (window.isUpdatingFromFirestore) return;
                cell.classList.add('editing');
                textEdit.focus();
                textEdit.setSelectionRange(textEdit.value.length, textEdit.value.length);
            }
            
            function stopEditing() {
                if (!cell.classList.contains('editing')) return;
                cell.classList.remove('editing');
                const newValue = textEdit.value.trim();
                if (!window.timetable[day]) window.timetable[day] = {};
                window.timetable[day][slot] = newValue;
                saveTimetable();
                contentDiv.innerHTML = escapeHtml(newValue);
            }
            
            cell.addEventListener('dblclick', startEditing);
            
            let tapCount = 0;
            cell.addEventListener('click', () => {
                tapCount++;
                setTimeout(() => {
                    if (tapCount === 2) {
                        startEditing();
                    }
                    tapCount = 0;
                }, 300);
            });
            
            textEdit.addEventListener('blur', stopEditing);
            textEdit.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    stopEditing();
                }
            });
        });
    }

    // 8. Study Blueprint Checkboxes Sync logic
    const blueprintCheckboxesSelector = document.querySelectorAll('.task-checkbox');
    blueprintCheckboxesSelector.forEach(checkbox => {
        const taskId = checkbox.getAttribute('data-task-id');
        checkbox.addEventListener('change', (e) => {
            if (window.isUpdatingFromFirestore) return;
            if (typeof window.playInteractionSound === 'function') window.playInteractionSound('check');
            window.blueprintCheckboxes[taskId] = e.target.checked;
            
            const storagePrefix = window.currentUser + '_';
            localStorage.setItem(storagePrefix + taskId, e.target.checked);
            window.pushStateToFirestore();
        });
    });

    // Mahi Dynamic Study Blueprint rendering & editing helpers
    function renderMahiBlueprint() {
        const container = document.getElementById('mahi-blueprint-timeline');
        if (!container) return;

        if (!window.blueprintTasks || window.blueprintTasks.length === 0) {
            container.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 2rem 0; font-size: 0.9rem;">No blueprint tasks logged yet. Add one above!</div>`;
            return;
        }

        // Group tasks by Phase first, then by Day/Date
        const phases = {};
        window.blueprintTasks.forEach(task => {
            const phase = task.phase || "Study Leave";
            if (!phases[phase]) phases[phase] = {};
            const date = task.date || "General";
            if (!phases[phase][date]) phases[phase][date] = [];
            phases[phase][date].push(task);
        });

        let html = '';
        
        // Loop through phases in order
        const sortedPhases = ["Study Leave", "Mock Exams"];
        
        sortedPhases.forEach(phaseName => {
            if (window.currentMahiPhaseFilter && window.currentMahiPhaseFilter !== 'All' && phaseName !== window.currentMahiPhaseFilter) {
                return;
            }
            if (!phases[phaseName]) return;
            
            html += `<h2 style="margin-top: 2rem;">Phase: ${escapeHtml(phaseName)}</h2>`;
            html += `<div class="glass-panel" style="padding-top: 1.5rem; padding-bottom: 0.5rem;">`;
            
            const datesInPhase = phases[phaseName];
            
            // To render in chronological order, we can sort dates if needed, but since they're 
            // loaded in chronological order in our default tasks array, standard loop keeps their order.
            Object.keys(datesInPhase).forEach(dateStr => {
                html += `
                    <div class="timeline-day">
                        <div class="day-header">${escapeHtml(dateStr)}</div>
                        <ul class="task-list">
                `;
                
                datesInPhase[dateStr].forEach(task => {
                    const taskIndex = window.blueprintTasks.indexOf(task);
                    html += `
                        <li class="task-item ${escapeHtml(task.subject)}" style="margin-bottom: 0.8rem;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                                <label class="task-checkbox-container" style="flex-grow: 1; margin: 0;">
                                    <input type="checkbox" class="mahi-task-checkbox" data-index="${taskIndex}" ${task.completed ? 'checked' : ''} onchange="toggleMahiBlueprintTask(${taskIndex}, this.checked)">
                                    <span class="checkmark"></span>
                                    <span class="task-text">
                                        <span class="time-badge">${escapeHtml(task.time)}</span>
                                        <strong>${escapeHtml(task.title)}</strong> - ${escapeHtml(task.desc)}
                                        ${task.tip ? `<span class="calc-tip" style="${task.subject === 'span' ? 'color: var(--span-color); background: rgba(255, 127, 80, 0.1); border-color: rgba(255, 127, 80, 0.3);' : ''}">${escapeHtml(task.tip)}</span>` : ''}
                                    </span>
                                </label>
                                <div style="display: flex; gap: 6px; margin-top: 4px;">
                                    <button class="delete-blueprint-btn" onclick="editMahiBlueprintTask(${taskIndex})" title="Edit Target" style="padding: 0.2rem 0.4rem; font-size: 0.85rem;">✏️</button>
                                    <button class="delete-blueprint-btn" onclick="deleteMahiBlueprintTask(${taskIndex})" title="Delete Target" style="padding: 0.2rem 0.4rem; font-size: 0.85rem;">✕</button>
                                </div>
                            </div>
                        </li>
                    `;
                });
                
                html += `
                        </ul>
                    </div>
                `;
            });
            
            html += `</div>`;
        });

        container.innerHTML = html;
    }

    window.toggleMahiBlueprintTask = function(index, checked) {
        if (window.isUpdatingFromFirestore) return;
        if (typeof window.playInteractionSound === 'function') window.playInteractionSound('check');
        window.blueprintTasks[index].completed = checked;
        const storagePrefix = window.currentUser + '_';
        localStorage.setItem(storagePrefix + 'blueprint_tasks', JSON.stringify(window.blueprintTasks));
        window.pushStateToFirestore();
        renderMahiBlueprint();
    };

    window.deleteMahiBlueprintTask = function(index) {
        if (window.isUpdatingFromFirestore) return;
        if (confirm("Are you sure you want to delete this blueprint target?")) {
            if (typeof window.playInteractionSound === 'function') window.playInteractionSound('click');
            window.blueprintTasks.splice(index, 1);
            const storagePrefix = window.currentUser + '_';
            localStorage.setItem(storagePrefix + 'blueprint_tasks', JSON.stringify(window.blueprintTasks));
            window.pushStateToFirestore();
            renderMahiBlueprint();
        }
    };

    window.showAddMahiBlueprintForm = function() {
        const form = document.getElementById('mahi-blueprint-form');
        const container = document.getElementById('mahi-blueprint-form-container');
        if (!form || !container) return;
        
        form.reset();
        document.getElementById('mahi-form-task-index').value = "-1";
        document.getElementById('mahi-form-title-heading').innerText = "Add New Blueprint Target";
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
    };

    window.hideMahiBlueprintForm = function() {
        const container = document.getElementById('mahi-blueprint-form-container');
        if (container) container.style.display = 'none';
    };

    window.editMahiBlueprintTask = function(index) {
        const task = window.blueprintTasks[index];
        if (!task) return;

        document.getElementById('mahi-form-task-index').value = index;
        document.getElementById('mahi-form-subject').value = task.subject;
        document.getElementById('mahi-form-date').value = task.date;
        document.getElementById('mahi-form-phase').value = task.phase;
        document.getElementById('mahi-form-time').value = task.time;
        document.getElementById('mahi-form-title').value = task.title;
        document.getElementById('mahi-form-desc').value = task.desc;
        document.getElementById('mahi-form-tip').value = task.tip || "";
        
        document.getElementById('mahi-form-title-heading').innerText = "Edit Blueprint Target";
        
        const container = document.getElementById('mahi-blueprint-form-container');
        if (container) {
            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const mahiBlueprintForm = document.getElementById('mahi-blueprint-form');
    if (mahiBlueprintForm) {
        mahiBlueprintForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (window.isUpdatingFromFirestore) return;

            const index = parseInt(document.getElementById('mahi-form-task-index').value);
            const subject = document.getElementById('mahi-form-subject').value;
            const date = document.getElementById('mahi-form-date').value.trim();
            const phase = document.getElementById('mahi-form-phase').value;
            const time = document.getElementById('mahi-form-time').value.trim();
            const title = document.getElementById('mahi-form-title').value.trim();
            const desc = document.getElementById('mahi-form-desc').value.trim();
            const tip = document.getElementById('mahi-form-tip').value.trim();

            if (!date || !title) {
                alert("Please fill in Date and Title!");
                return;
            }

            const taskData = {
                id: index >= 0 ? window.blueprintTasks[index].id : "mahi-task-" + Date.now(),
                subject,
                date,
                phase,
                time,
                title,
                desc,
                tip: tip || null,
                completed: index >= 0 ? window.blueprintTasks[index].completed : false
            };

            if (index >= 0) {
                window.blueprintTasks[index] = taskData;
            } else {
                window.blueprintTasks.push(taskData);
            }

            const storagePrefix = window.currentUser + '_';
            localStorage.setItem(storagePrefix + 'blueprint_tasks', JSON.stringify(window.blueprintTasks));
            window.pushStateToFirestore();
            
            window.hideMahiBlueprintForm();
            renderMahiBlueprint();
        });
    }

    function renderBlueprintCheckboxes() {
        if (window.currentUser === 'GF') {
            renderMahiBlueprint();
        } else {
            blueprintCheckboxesSelector.forEach(checkbox => {
                const taskId = checkbox.getAttribute('data-task-id');
                if (taskId) {
                    checkbox.checked = !!window.blueprintCheckboxes[taskId];
                }
            });
        }
    }


    // 9. Coordinate All UI Redraw Updates (called from firebase-sync listener)
    window.triggerUIUpdates = function() {
        updateAnalytics();
        renderShifts();
        if (typeof window.initClockStatus === 'function') {
            window.initClockStatus();
        }
        renderTimetable();
        renderBlueprintCheckboxes();
        if (typeof window.renderMistakes === 'function') {
            window.renderMistakes();
        }
        if (typeof window.renderCompetitionWidget === 'function') {
            window.renderCompetitionWidget();
        }
        if (typeof window.updateCountdown === 'function') {
            window.updateCountdown();
        }
    };


    // 10. Start application based on cached profile
    const cachedUser = localStorage.getItem('mocks_study_plan_current_user') || 'BF';
    window.selectPortalUser(cachedUser);

    // 11. Version Update Checker
    const CURRENT_VERSION = document.querySelector('meta[name="version"]')?.getAttribute('content') || '1.0.0';
    let updateToastShown = false;
    let isCacheLocked = false;
    let targetVersion = '';

    window.refreshToUpdate = function(version) {
        const targetVer = version || window.serverVersion || '1.0.0';
        try {
            // Save attempt metadata in sessionStorage
            sessionStorage.setItem('mocks_update_attempt_version', targetVer);
            sessionStorage.setItem('mocks_update_attempt_time', Date.now().toString());
            
            // Build cache-busted redirect URL preserving hash/parameters
            const url = new URL(window.location.href);
            url.searchParams.set('u', targetVer);
            window.location.href = url.toString();
        } catch (e) {
            console.error("Refresh redirect failed, falling back to reload:", e);
            window.location.reload();
        }
    };
    
    window.hideUpdateToast = function() {
        const toast = document.getElementById('update-toast');
        if (toast) {
            toast.classList.remove('show');
        }
    };

    function showUpdateToast(serverVersion, isLocked = false) {
        const toast = document.getElementById('update-toast');
        if (toast) {
            const textEl = toast.querySelector('.update-toast-text');
            const btnEl = toast.querySelector('.btn-update-refresh');
            
            if (isLocked) {
                if (textEl) textEl.innerHTML = `Update (v${serverVersion}) is available, but your browser is serving cached files. Please force-reload (<kbd>Ctrl+F5</kbd> / <kbd>⌘+Shift+R</kbd>) to apply.`;
                if (btnEl) {
                    btnEl.innerText = "Got it";
                    btnEl.setAttribute('onclick', 'window.hideUpdateToast()');
                }
            } else {
                if (textEl) textEl.innerText = "A new version of the Website is available!";
                if (btnEl) {
                    btnEl.innerText = "Refresh to Update";
                    btnEl.setAttribute('onclick', `window.refreshToUpdate('${serverVersion}')`);
                }
            }
            toast.classList.add('show');
            updateToastShown = true;
        }
    }

    // Check for cache lock on initial load
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlVersion = urlParams.get('u');
        const sessionAttemptVersion = sessionStorage.getItem('mocks_update_attempt_version');
        const sessionAttemptTime = sessionStorage.getItem('mocks_update_attempt_time');
        
        const attemptedRecently = sessionAttemptTime && (Date.now() - parseInt(sessionAttemptTime, 10) < 60000);
        const expectedVersion = urlVersion || (attemptedRecently ? sessionAttemptVersion : null);

        if (expectedVersion && expectedVersion !== CURRENT_VERSION) {
            isCacheLocked = true;
            targetVersion = expectedVersion;
            window.serverVersion = targetVersion;
            
            // Show cache-lock toast with a brief delay
            setTimeout(() => {
                showUpdateToast(targetVersion, true);
            }, 1500);
        }
    } catch (e) {
        console.warn("Failed checking update query param:", e);
    }

    async function checkForUpdates() {
        if (updateToastShown || isCacheLocked) return;
        
        // Skip check if running on local file protocol to avoid CORS errors
        if (window.location.protocol === 'file:') {
            return;
        }

        try {
            // Fetch index.html with a cache-busting query parameter
            const response = await fetch(`${window.location.origin}${window.location.pathname}?cb=${Date.now()}`);
            if (!response.ok) return;

            const htmlText = await response.text();
            
            // Extract version from meta tag using DOMParser (highly robust)
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const serverVersion = doc.querySelector('meta[name="version"]')?.getAttribute('content');
            
            if (serverVersion && serverVersion !== CURRENT_VERSION) {
                window.serverVersion = serverVersion;
                // If this is a version we recently attempted to update to, mark as cache-locked
                const sessionAttemptVersion = sessionStorage.getItem('mocks_update_attempt_version');
                const sessionAttemptTime = sessionStorage.getItem('mocks_update_attempt_time');
                const attemptedRecently = sessionAttemptTime && (Date.now() - parseInt(sessionAttemptTime, 10) < 60000);

                if (serverVersion === sessionAttemptVersion && attemptedRecently) {
                    isCacheLocked = true;
                    targetVersion = serverVersion;
                    showUpdateToast(serverVersion, true);
                } else {
                    showUpdateToast(serverVersion, false);
                }
            }
        } catch (err) {
            console.warn("Update check failed:", err);
        }
    }

    // Expose globally so components (like chat) can trigger checks
    window.checkForUpdates = checkForUpdates;

    // Run update check on load (with a small delay to prioritize page render)
    setTimeout(checkForUpdates, 3000);

    // Periodically check every 5 minutes (300,000 ms)
    setInterval(checkForUpdates, 5 * 60 * 1000);

    // Check when user brings the tab back to focus (visibilitychange)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkForUpdates();
            if (typeof updateLiveTime === 'function') updateLiveTime();
            if (typeof updateDynamicStatus === 'function') updateDynamicStatus();
            if (typeof updateAnalytics === 'function') updateAnalytics();
        }
    });

    // ==========================================================================
    // Gamification & Audio Synthesis & Floating Reactions
    // ==========================================================================

    // Web Audio API Synthesizer Manager
    window.playInteractionSound = function(type) {
        const isSoundOn = localStorage.getItem('mocks_chat_sound_enabled') !== 'false';
        if (!isSoundOn) return;
        
        try {
            if (!window.audioCtx) {
                window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (window.audioCtx.state === 'suspended') {
                window.audioCtx.resume();
            }
            const ctx = window.audioCtx;
            const time = ctx.currentTime;
            
            if (type === 'click' || type === 'tab') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, time);
                gain.gain.setValueAtTime(0.01, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(time);
                osc.stop(time + 0.08);
            } else if (type === 'check') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, time);
                gain.gain.setValueAtTime(0.03, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(time);
                osc.stop(time + 0.3);
            } else if (type === 'clockIn') {
                const freqs = [300, 400, 500, 600];
                freqs.forEach((f, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, time + idx * 0.08);
                    gain.gain.setValueAtTime(0.03, time + idx * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.08 + 0.25);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(time + idx * 0.08);
                    osc.stop(time + idx * 0.08 + 0.25);
                });
            } else if (type === 'clockOut') {
                const freqs = [600, 500, 400, 300];
                freqs.forEach((f, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, time + idx * 0.08);
                    gain.gain.setValueAtTime(0.03, time + idx * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.08 + 0.25);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(time + idx * 0.08);
                    osc.stop(time + idx * 0.08 + 0.25);
                });
            } else if (type === 'pomoStart') {
                [0, 0.15].forEach(delay => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(660, time + delay);
                    gain.gain.setValueAtTime(0.03, time + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + delay + 0.12);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(time + delay);
                    osc.stop(time + delay + 0.12);
                });
            } else if (type === 'pomoReset') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, time);
                gain.gain.setValueAtTime(0.03, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(time);
                osc.stop(time + 0.15);
            } else if (type === 'sticker') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(900, time);
                osc.frequency.exponentialRampToValueAtTime(400, time + 0.1);
                gain.gain.setValueAtTime(0.04, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(time);
                osc.stop(time + 0.1);
            } else if (type === 'reaction') {
                const freqs = [800, 1000, 1200];
                freqs.forEach((f, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, time + idx * 0.05);
                    gain.gain.setValueAtTime(0.02, time + idx * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.05 + 0.1);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(time + idx * 0.05);
                    osc.stop(time + idx * 0.05 + 0.1);
                });
            } else if (type === 'nudge') {
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(523.25, time);
                gain1.gain.setValueAtTime(0.05, time);
                gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start(time);
                osc1.stop(time + 0.5);

                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(783.99, time + 0.1);
                gain2.gain.setValueAtTime(0.05, time + 0.1);
                gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(time + 0.1);
                osc2.stop(time + 0.6);
            }
        } catch (e) {
            console.warn("Audio synthesis block error:", e);
        }
    };

    // Pickers visibility tracker
    window.currentPickerType = null;
    window.togglePicker = function(type) {
        window.playInteractionSound('click');
        if (window.currentPickerType === type) {
            window.currentPickerType = null;
        } else {
            window.currentPickerType = type;
        }
        if (typeof window.renderCompetitionWidget === 'function') {
            window.renderCompetitionWidget();
        }
    };

    // Reaction and Sticker sync mechanisms
    window.sendReactionToPartner = function(emoji) {
        window.currentPickerType = null;
        const partner = window.currentUser === 'GF' ? 'BF' : 'GF';
        window.liveReaction = { emoji: emoji, timestamp: Date.now() };
        
        const storagePrefix = window.currentUser + '_';
        localStorage.setItem(storagePrefix + 'live_reaction', JSON.stringify(window.liveReaction));
        
        const docId = (window.currentUser === 'GF') ? 'gf_dashboard' : 'dashboard';
        window.db.collection('study_data').doc(docId).update({
            liveReaction: window.liveReaction
        }).catch(err => {
            console.error("Failed to push live reaction:", err);
        });
        
        window.triggerFloatingReaction(emoji);
        if (typeof window.renderCompetitionWidget === 'function') {
            window.renderCompetitionWidget();
        }
    };

    window.pinStickerOnPartner = function(emoji) {
        window.currentPickerType = null;
        const partner = window.currentUser === 'GF' ? 'BF' : 'GF';
        const partnerDocId = (partner === 'GF') ? 'gf_dashboard' : 'dashboard';
        
        // Retrieve current pinned stickers of partner
        const stats = window.competitionStats[partner];
        let currentStickers = stats ? [...(stats.pinnedStickers || [])] : [];
        
        // Single pinned sticker design - replace last
        const newSticker = {
            emoji: emoji,
            sender: window.currentUser,
            timestamp: Date.now()
        };
        currentStickers = [newSticker];
        
        window.playInteractionSound('sticker');
        
        window.db.collection('study_data').doc(partnerDocId).update({
            pinnedStickers: currentStickers
        }).catch(err => {
            console.error("Failed to pin sticker on partner:", err);
        });
        if (typeof window.renderCompetitionWidget === 'function') {
            window.renderCompetitionWidget();
        }
    };

    window.sendNudgeToPartner = function() {
        window.sendReactionToPartner('🔔');
    };

    // Floating visual animation burst
    window.triggerFloatingReaction = function(emoji) {
        const canvas = document.getElementById('reaction-canvas');
        if (!canvas) return;
        
        if (emoji !== '🔔') {
            window.playInteractionSound('reaction');
        } else {
            window.playInteractionSound('nudge');
            
            // Spawn html toast notification
            const partner = window.currentUser === 'GF' ? 'BF' : 'GF';
            const partnerName = partner === 'GF' ? 'Mahi' : 'Rudolph';
            showNudgeToast(`${partnerName} is nudging you to study! 🔔`);
        }
        
        const numParticles = emoji === '🔔' ? 4 : 8;
        for (let i = 0; i < numParticles; i++) {
            const el = document.createElement('div');
            el.className = 'floating-emoji';
            el.textContent = emoji;
            
            const leftVal = 10 + Math.random() * 80;
            const delayVal = Math.random() * 0.4;
            const sizeVal = 1.5 + Math.random() * 1.5;
            
            el.style.left = `${leftVal}vw`;
            el.style.fontSize = `${sizeVal}rem`;
            el.style.animationDelay = `${delayVal}s`;
            
            canvas.appendChild(el);
            setTimeout(() => el.remove(), 3500);
        }
    };

    function showNudgeToast(msg) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.right = '30px';
        toast.style.background = 'var(--toast-bg)';
        toast.style.border = '1px solid var(--exam-color)';
        toast.style.boxShadow = '0 12px 35px rgba(0,0,0,0.6)';
        toast.style.padding = '0.9rem 1.4rem';
        toast.style.borderRadius = '10px';
        toast.style.color = '#fff';
        toast.style.fontWeight = 'bold';
        toast.style.fontSize = '0.85rem';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '8px';
        toast.style.zIndex = '99999';
        toast.style.animation = 'pickerSlide 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        toast.innerHTML = `<span>⚡</span> <span>${msg}</span>`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // Dynamic Streak Calculator based on shifts
    function calculateStreak() {
        if (!window.shifts) return;
        
        const dailyMins = {};
        window.shifts.forEach(s => {
            const dateStr = new Date(s.date).toDateString();
            dailyMins[dateStr] = (dailyMins[dateStr] || 0) + s.duration;
        });

        let streak = 0;
        let checkDate = new Date();
        const todayStr = checkDate.toDateString();
        
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        const todayMins = dailyMins[todayStr] || 0;
        const yesterdayMins = dailyMins[yesterdayStr] || 0;

        if (todayMins >= 90 || yesterdayMins >= 90) {
            let currentCheck = todayMins >= 90 ? checkDate : yesterday;
            while (true) {
                const currentStr = currentCheck.toDateString();
                if (dailyMins[currentStr] >= 90) {
                    streak++;
                    currentCheck.setDate(currentCheck.getDate() - 1);
                } else {
                    break;
                }
            }
        }
        
        window.grindStreak = streak;
        window.lastStudyDate = todayMins >= 90 ? todayStr : (yesterdayMins >= 90 ? yesterdayStr : '');
    }
});
