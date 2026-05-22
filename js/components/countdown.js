/* js/countdown.js */

document.addEventListener('DOMContentLoaded', () => {
    const examDates = {
        'BF': {
            label: "⏰ Countdown to First Exam (Physics HL)",
            date: new Date('2026-06-01T07:50:00').getTime()
        },
        'GF': {
            label: "⏰ Countdown to First Exam (Spanish ab initio)",
            date: new Date('2026-06-05T07:50:00').getTime()
        }
    };

    let countdownInterval = null;

    window.updateCountdown = function() {
        const currentUser = window.currentUser || 'BF';
        const profileExam = examDates[currentUser] || examDates['BF'];
        
        const now = new Date().getTime();
        const distance = profileExam.date - now;
        
        const titleEl = document.getElementById('countdown-banner-title');
        const timerEl = document.getElementById('countdown-timer-container');

        if (!titleEl || !timerEl) {
            console.error("Countdown DOM elements not found!");
            return;
        }

        if (distance < 0) {
            titleEl.innerHTML = "🏁 THE MOCK EXAMS HAVE BEGUN! 🏁";
            timerEl.style.display = 'none';
            return;
        }

        timerEl.style.display = 'flex';
        titleEl.innerHTML = profileExam.label;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days-val');
        const hoursEl = document.getElementById('hours-val');
        const minsEl = document.getElementById('mins-val');
        const secsEl = document.getElementById('secs-val');

        if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
        if (minsEl) minsEl.innerText = String(minutes).padStart(2, '0');
        if (secsEl) secsEl.innerText = String(seconds).padStart(2, '0');
    };

    // Run countdown update loop
    countdownInterval = setInterval(window.updateCountdown, 1000);
    window.updateCountdown();
});

