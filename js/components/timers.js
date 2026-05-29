/* js/components/timers.js */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Live clock updates in the clocking panel
    const liveTimeEl = document.getElementById('live-time');
    const liveDateEl = document.getElementById('live-date');

    function updateLiveTime() {
        if (!liveTimeEl || !liveDateEl) return;
        const now = new Date();
        liveTimeEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        liveDateEl.innerText = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    if (liveTimeEl && liveDateEl) {
        setInterval(updateLiveTime, 1000);
        updateLiveTime();
    }

    // 2. Stopwatch / Clock-In Logic
    const btnClock = document.getElementById('btn-clock');
    const clockStatus = document.getElementById('clock-status');
    const clockStatusText = document.getElementById('clock-status-text');
    const clockPulse = document.getElementById('clock-pulse');
    const activeSessionInfo = document.getElementById('active-session-info');
    const sessionDurationVal = document.getElementById('session-duration');
    const shiftSubjectSelect = document.getElementById('shift-subject');

    let activeSessionInterval = null;

    function startActiveSessionTicker() {
        if (activeSessionInterval) clearInterval(activeSessionInterval);
        if (activeSessionInfo) activeSessionInfo.style.display = 'block';
        
        function tick() {
            if (!window.activeSession) return;
            const elapsedSecs = Math.floor((Date.now() - window.activeSession.start) / 1000);
            const elapsedMins = Math.floor(elapsedSecs / 60);
            if (sessionDurationVal) sessionDurationVal.innerText = elapsedMins;
        }
        
        activeSessionInterval = setInterval(tick, 1000);
        tick();
    }

    window.initClockStatus = function() {
        if (!btnClock || !clockStatus || !clockStatusText) return;
        if (window.activeSession) {
            clockStatus.className = 'clock-status clocked-in';
            clockStatusText.innerText = 'CLOCKED IN';
            if (clockPulse) clockPulse.style.display = 'inline-block';
            btnClock.className = 'btn-clock clock-out';
            btnClock.innerText = 'Clock Out 🏁';
            if (shiftSubjectSelect) {
                shiftSubjectSelect.value = window.activeSession.subject;
                shiftSubjectSelect.disabled = true;
            }
            startActiveSessionTicker();
        } else {
            clockStatus.className = 'clock-status clocked-out';
            clockStatusText.innerText = 'OFF THE CLOCK';
            if (clockPulse) clockPulse.style.display = 'none';
            btnClock.className = 'btn-clock clock-in';
            btnClock.innerText = 'Clock In ⚡';
            if (shiftSubjectSelect) shiftSubjectSelect.disabled = false;
            if (activeSessionInfo) activeSessionInfo.style.display = 'none';
            if (activeSessionInterval) {
                clearInterval(activeSessionInterval);
                activeSessionInterval = null;
            }
        }
    };

    if (btnClock) {
        btnClock.addEventListener('click', () => {
            if (window.isUpdatingFromFirestore) return;
            if (!window.activeSession) {
                // Clock In
                if (typeof window.playInteractionSound === 'function') window.playInteractionSound('clockIn');
                window.activeSession = {
                    start: Date.now(),
                    subject: shiftSubjectSelect ? shiftSubjectSelect.value : 'math'
                };
                const storagePrefix = window.currentUser + '_';
                localStorage.setItem(storagePrefix + 'active_session', JSON.stringify(window.activeSession));
                window.pushStateToFirestore();
                window.initClockStatus();
            } else {
                // Clock Out
                if (typeof window.playInteractionSound === 'function') window.playInteractionSound('clockOut');
                const durationSecs = Math.floor((Date.now() - window.activeSession.start) / 1000);
                const durationMins = Math.max(1, Math.round(durationSecs / 60));
                
                const newShift = {
                    date: new Date().toISOString(),
                    subject: window.activeSession.subject,
                    duration: durationMins
                };
                
                window.shifts.push(newShift);
                if (typeof window.saveShifts === 'function') {
                    window.saveShifts();
                } else {
                    const storagePrefix = window.currentUser + '_';
                    localStorage.setItem(storagePrefix + 'shifts', JSON.stringify(window.shifts));
                    window.pushStateToFirestore();
                }
                
                const storagePrefix = window.currentUser + '_';
                localStorage.removeItem(storagePrefix + 'active_session');
                window.activeSession = null;
                window.pushStateToFirestore();
                
                window.initClockStatus();
                if (typeof window.updateAnalytics === 'function') window.updateAnalytics();
                if (typeof window.renderShifts === 'function') window.renderShifts();
            }
        });
    }

    // 3. Pomodoro Timer Logic
    let pomoTimeRemaining = 3000; // default 50 mins (50 * 60 = 3000 seconds)
    let pomoTargetEndTime = null; // target timestamp when timer finishes
    let pomoTimerInterval = null;
    let pomoIsRunning = false;
    
    let pomoSessionDuration = 3000; // default 50 mins
    let pomoSessionType = 'work-50';

    const pomoDisplay = document.getElementById('pomo-display');
    const pomoStartBtn = document.getElementById('pomo-start');
    const pomoResetBtn = document.getElementById('pomo-reset');
    const pomoModeBtns = document.querySelectorAll('.pomo-mode-btn');
    const pomoCustomInput = document.getElementById('pomo-custom-input');
    const pomoCustomSetBtn = document.getElementById('pomo-custom-set-btn');

    function updatePomoDisplay() {
        if (!pomoDisplay) return;
        const mins = Math.floor(pomoTimeRemaining / 60);
        const secs = pomoTimeRemaining % 60;
        pomoDisplay.innerText = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    function playPomoAlarm() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            function beep(frequency, duration, startTime) {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.value = frequency;
                
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            }
            
            const now = audioCtx.currentTime;
            beep(880, 0.25, now);
            beep(880, 0.25, now + 0.35);
            beep(1046.5, 0.4, now + 0.7);
        } catch (e) {
            console.error("Audio synth error:", e);
        }
    }

    function startPomoTimer() {
        if (!pomoStartBtn) return;
        if (pomoTimerInterval) clearInterval(pomoTimerInterval);
        
        pomoIsRunning = true;
        pomoStartBtn.innerText = 'Pause';
        pomoStartBtn.className = 'pomo-btn pause';
        
        pomoTargetEndTime = Date.now() + pomoTimeRemaining * 1000;
        
        function tick() {
            const now = Date.now();
            if (now < pomoTargetEndTime) {
                pomoTimeRemaining = Math.max(0, Math.ceil((pomoTargetEndTime - now) / 1000));
                updatePomoDisplay();
            } else {
                pomoTimeRemaining = 0;
                updatePomoDisplay();
                clearInterval(pomoTimerInterval);
                pomoTimerInterval = null;
                pomoTargetEndTime = null;
                pomoIsRunning = false;
                pomoStartBtn.innerText = 'Start';
                pomoStartBtn.className = 'pomo-btn start';
                playPomoAlarm();
                
                // Log completed Pomodoro session
                try {
                    if (!window.pomosCompleted) window.pomosCompleted = [];
                    const subjectVal = document.getElementById('shift-subject')?.value || 'other';
                    window.pomosCompleted.push({
                        timestamp: Date.now(),
                        duration: Math.round(pomoSessionDuration / 60), // in minutes
                        type: pomoSessionType,
                        subject: subjectVal
                    });
                    const storagePrefix = window.currentUser + '_';
                    localStorage.setItem(storagePrefix + 'pomos_completed', JSON.stringify(window.pomosCompleted));
                    if (typeof window.pushStateToFirestore === 'function') {
                        window.pushStateToFirestore();
                    }
                } catch (e) {
                    console.warn("Failed to log Pomodoro completion:", e);
                }
                
                alert("⏰ Shift segment complete! Time for a rest block.");
            }
        }
        
        pomoTimerInterval = setInterval(tick, 200);
        tick();
    }

    function pausePomoTimer() {
        if (!pomoStartBtn) return;
        pomoIsRunning = false;
        pomoStartBtn.innerText = 'Start';
        pomoStartBtn.className = 'pomo-btn start';
        if (pomoTimerInterval) {
            clearInterval(pomoTimerInterval);
            pomoTimerInterval = null;
        }
        if (pomoTargetEndTime) {
            const now = Date.now();
            pomoTimeRemaining = Math.max(0, Math.ceil((pomoTargetEndTime - now) / 1000));
            pomoTargetEndTime = null;
        }
    }

    if (pomoStartBtn) {
        pomoStartBtn.addEventListener('click', () => {
            if (typeof window.playInteractionSound === 'function') window.playInteractionSound('pomoStart');
            if (pomoIsRunning) {
                pausePomoTimer();
            } else {
                startPomoTimer();
            }
        });
    }

    if (pomoResetBtn) {
        pomoResetBtn.addEventListener('click', () => {
            if (typeof window.playInteractionSound === 'function') window.playInteractionSound('pomoReset');
            pausePomoTimer();
            const activeBtn = document.querySelector('.pomo-mode-btn.active');
            if (activeBtn) {
                pomoTimeRemaining = parseInt(activeBtn.getAttribute('data-time'));
            } else {
                pomoTimeRemaining = 3000;
            }
            updatePomoDisplay();
        });
    }

    pomoModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof window.playInteractionSound === 'function') window.playInteractionSound('click');
            pomoModeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            pausePomoTimer();
            pomoSessionDuration = parseInt(btn.getAttribute('data-time'));
            pomoSessionType = btn.getAttribute('data-type');
            pomoTimeRemaining = pomoSessionDuration;
            updatePomoDisplay();
        });
    });

    // Custom timer logic (Allows setting custom minutes)
    if (pomoCustomSetBtn && pomoCustomInput) {
        pomoCustomSetBtn.addEventListener('click', () => {
            const mins = parseInt(pomoCustomInput.value);
            if (isNaN(mins) || mins < 1 || mins > 180) {
                alert("Please enter a valid duration between 1 and 180 minutes.");
                return;
            }
            
            if (typeof window.playInteractionSound === 'function') window.playInteractionSound('click');
            pomoModeBtns.forEach(b => b.classList.remove('active'));
            pausePomoTimer();
            pomoSessionDuration = mins * 60;
            pomoSessionType = 'custom';
            pomoTimeRemaining = pomoSessionDuration;
            updatePomoDisplay();
            pomoCustomInput.value = '';
        });
    }

    // Expose control to allow reset from main app if needed
    window.resetPomoToTime = function(seconds) {
        pausePomoTimer();
        pomoTimeRemaining = seconds;
        updatePomoDisplay();
    };

    // Update all timers immediately when tab visibility changes (resolves background tab lag)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Update Pomodoro display if running
            if (pomoIsRunning && pomoTargetEndTime) {
                const now = Date.now();
                if (now < pomoTargetEndTime) {
                    pomoTimeRemaining = Math.max(0, Math.ceil((pomoTargetEndTime - now) / 1000));
                } else {
                    pomoTimeRemaining = 0;
                }
                updatePomoDisplay();
            }
            // Update active session duration ticker immediately
            if (window.activeSession && typeof startActiveSessionTicker === 'function') {
                startActiveSessionTicker();
            }
            // Update countdown timer immediately
            if (typeof window.updateCountdown === 'function') {
                window.updateCountdown();
            }
        }
    });

    updatePomoDisplay();
});
