/* js/timer.js */

document.addEventListener('DOMContentLoaded', () => {
    let pomoTimeRemaining = 3000; // default 50 mins (50 * 60 = 3000 seconds)
    let pomoTimerInterval = null;
    let pomoIsRunning = false;

    const pomoDisplay = document.getElementById('pomo-display');
    const pomoStartBtn = document.getElementById('pomo-start');
    const pomoResetBtn = document.getElementById('pomo-reset');
    const pomoModeBtns = document.querySelectorAll('.pomo-mode-btn');
    const pomoCustomInput = document.getElementById('pomo-custom-input');
    const pomoCustomSetBtn = document.getElementById('pomo-custom-set-btn');

    function updatePomoDisplay() {
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
        if (pomoTimerInterval) clearInterval(pomoTimerInterval);
        
        pomoIsRunning = true;
        pomoStartBtn.innerText = 'Pause';
        pomoStartBtn.className = 'pomo-btn pause';
        
        pomoTimerInterval = setInterval(() => {
            if (pomoTimeRemaining > 0) {
                pomoTimeRemaining--;
                updatePomoDisplay();
            } else {
                clearInterval(pomoTimerInterval);
                pomoTimerInterval = null;
                pomoIsRunning = false;
                pomoStartBtn.innerText = 'Start';
                pomoStartBtn.className = 'pomo-btn start';
                playPomoAlarm();
                alert("⏰ Shift segment complete! Time for a rest block.");
            }
        }, 1000);
    }

    function pausePomoTimer() {
        pomoIsRunning = false;
        pomoStartBtn.innerText = 'Start';
        pomoStartBtn.className = 'pomo-btn start';
        if (pomoTimerInterval) {
            clearInterval(pomoTimerInterval);
            pomoTimerInterval = null;
        }
    }

    pomoStartBtn.addEventListener('click', () => {
        if (pomoIsRunning) {
            pausePomoTimer();
        } else {
            startPomoTimer();
        }
    });

    pomoResetBtn.addEventListener('click', () => {
        pausePomoTimer();
        const activeBtn = document.querySelector('.pomo-mode-btn.active');
        if (activeBtn) {
            pomoTimeRemaining = parseInt(activeBtn.getAttribute('data-time'));
        } else {
            pomoTimeRemaining = 3000;
        }
        updatePomoDisplay();
    });

    pomoModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            pomoModeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            pausePomoTimer();
            pomoTimeRemaining = parseInt(btn.getAttribute('data-time'));
            updatePomoDisplay();
        });
    });

    // Custom timer logic (Allows Mahi to set 70 min timer etc.)
    pomoCustomSetBtn.addEventListener('click', () => {
        const mins = parseInt(pomoCustomInput.value);
        if (isNaN(mins) || mins < 1 || mins > 180) {
            alert("Please enter a valid duration between 1 and 180 minutes.");
            return;
        }
        
        pomoModeBtns.forEach(b => b.classList.remove('active'));
        pausePomoTimer();
        pomoTimeRemaining = mins * 60;
        updatePomoDisplay();
        pomoCustomInput.value = '';
    });

    // Expose control to allow reset from main app if needed
    window.resetPomoToTime = function(seconds) {
        pausePomoTimer();
        pomoTimeRemaining = seconds;
        updatePomoDisplay();
    };

    updatePomoDisplay();
});
