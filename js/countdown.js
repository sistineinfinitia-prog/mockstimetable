/* js/countdown.js */

document.addEventListener('DOMContentLoaded', () => {
    const examDates = {
        'BF': {
            label: "⏰ Countdown to First Exam (Physics HL)",
            date: new Date('June 1, 2026 07:50:00').getTime()
        },
        'GF': {
            label: "⏰ Countdown to First Exam (Spanish ab initio)",
            date: new Date('June 5, 2026 07:50:00').getTime()
        }
    };

    let countdownInterval = null;

    window.updateCountdown = function() {
        const currentUser = window.currentUser || 'BF';
        const profileExam = examDates[currentUser] || examDates['BF'];
        
        const now = new Date().getTime();
        const distance = profileExam.date - now;
        
        const titleEl = document.getElementById('countdown-title');
        const timerEl = document.getElementById('countdown-timer');

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
        
        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    };

    // Run countdown update loop
    countdownInterval = setInterval(window.updateCountdown, 1000);
    window.updateCountdown();
});
