/* js/chat.js */

// Chat State
let isChatOpen = false;
let isSoundEnabled = localStorage.getItem('mocks_chat_sound_enabled') !== 'false'; // default to true
let chatMessages = [];
let lastReadTimestamp = parseInt(localStorage.getItem('mocks_chat_last_read_time')) || 0;
let notifTimeout = null;

// Audio Chime Synthesizer using Web Audio API
function playChatChime() {
    if (!isSoundEnabled) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
            // Browsers block audio until user interaction
            return;
        }
        
        const time = audioCtx.currentTime;
        
        // Note 1: E5 (659.25 Hz) - bright and clean
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, time);
        gain1.gain.setValueAtTime(0.08, time);
        gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(time);
        osc1.stop(time + 0.4);
        
        // Note 2: B5 (987.77 Hz) - bright fourth/fifth interval chime
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(987.77, time + 0.12);
        gain2.gain.setValueAtTime(0.08, time + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.7);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(time + 0.12);
        osc2.stop(time + 0.7);
    } catch (err) {
        console.warn("Web Audio chime failed to play:", err);
    }
}

// Format timestamp helper
function formatChatTime(ms) {
    if (!ms) return '';
    const date = new Date(ms);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
}

// Get clean user display name
function getPartnerDisplayName(userCode) {
    return userCode === 'GF' ? 'Mahi' : 'Rudolph';
}

function getPartnerAvatar(userCode) {
    return userCode === 'GF' ? '👩‍💻' : '👨‍💻';
}

// Toggle Chat Sound Settings
window.toggleChatSound = function() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('mocks_chat_sound_enabled', isSoundEnabled);
    updateSoundBtnUI();
};

function updateSoundBtnUI() {
    const soundBtn = document.getElementById('chat-sound-toggle');
    if (soundBtn) {
        soundBtn.innerHTML = isSoundEnabled ? '🔊' : '🔇';
        soundBtn.title = isSoundEnabled ? 'Mute Chat Sound' : 'Unmute Chat Sound';
    }
}

// Toggle Collapsible Chat Panel
window.toggleChatWindow = function() {
    const panel = document.getElementById('chat-panel');
    const badge = document.getElementById('chat-unread-badge');
    
    isChatOpen = !isChatOpen;
    
    if (isChatOpen) {
        panel.classList.add('active');
        // Clear unread state
        lastReadTimestamp = Date.now();
        localStorage.setItem('mocks_chat_last_read_time', lastReadTimestamp);
        if (badge) badge.classList.remove('show');
        closeChatNotification();
        
        // Focus input
        setTimeout(() => {
            const input = document.getElementById('chat-message-input');
            if (input) input.focus();
            scrollChatToBottom();
        }, 100);
    } else {
        panel.classList.remove('active');
    }
};

// Scroll chat to bottom helper
function scrollChatToBottom() {
    const box = document.getElementById('chat-messages-box');
    if (box) {
        box.scrollTop = box.scrollHeight;
    }
}

// UI Rendering for Chat History
function renderChatHistory() {
    const box = document.getElementById('chat-messages-box');
    if (!box) return;
    
    if (!chatMessages || chatMessages.length === 0) {
        box.innerHTML = `
            <div style="color: var(--text-muted); text-align: center; font-size: 0.85rem; padding: 2rem 1rem; font-style: italic;">
                No messages yet. Send a note to start coordinating! 📚
            </div>
        `;
        return;
    }
    
    box.innerHTML = chatMessages.map(msg => {
        const isSent = msg.sender === window.currentUser;
        const alignClass = isSent ? 'sent' : 'received';
        const userThemeClass = msg.sender; // BF or GF
        
        return `
            <div class="chat-message ${alignClass} ${userThemeClass}">
                <div class="chat-bubble">
                    ${escapeChatHtml(msg.text)}
                </div>
                <span class="chat-meta">${formatChatTime(msg.timestamp)}</span>
            </div>
        `;
    }).join('');
    
    scrollChatToBottom();
}

// Escape HTML utility for safety
function escapeChatHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Submit chat handler
window.handleChatSubmit = async function(event) {
    event.preventDefault();
    const input = document.getElementById('chat-message-input');
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    input.value = ''; // Clear input immediately for snappy experience
    
    const message = {
        sender: window.currentUser,
        text: text,
        timestamp: Date.now()
    };
    
    try {
        const chatDocRef = window.db.collection('study_data').doc('chat');
        
        // Update Firestore transactionally, capping messages list at 200 entries
        await window.db.runTransaction(async (transaction) => {
            const doc = await transaction.get(chatDocRef);
            let messages = [];
            
            if (doc.exists) {
                messages = doc.data().messages || [];
            }
            
            messages.push(message);
            
            // Keep only the last 200 messages
            if (messages.length > 200) {
                messages = messages.slice(messages.length - 200);
            }
            
            transaction.set(chatDocRef, { messages }, { merge: true });
        });
        
        // Update lastReadTimestamp immediately on send
        lastReadTimestamp = Date.now();
        localStorage.setItem('mocks_chat_last_read_time', lastReadTimestamp);
        
    } catch (err) {
        console.error("Failed to send chat message:", err);
        alert("Could not send message. Please try again.");
    }
};

// Side Toast Notifications
window.showChatNotification = function(sender, messageText) {
    if (isChatOpen) return; // Don't show toast if chat window is open
    
    const toast = document.getElementById('chat-notification-toast');
    const senderEl = document.getElementById('chat-notif-sender');
    const msgEl = document.getElementById('chat-notif-message');
    const avatarEl = document.getElementById('chat-notif-avatar');
    
    if (!toast || !senderEl || !msgEl) return;
    
    senderEl.textContent = getPartnerDisplayName(sender);
    msgEl.textContent = messageText;
    if (avatarEl) {
        avatarEl.textContent = getPartnerAvatar(sender);
    }
    
    // Clear existing timer if one is running
    if (notifTimeout) {
        clearTimeout(notifTimeout);
    }
    
    toast.classList.add('show');
    
    // Play chime synthesizer sound
    playChatChime();
    
    // Slide out after 4 seconds
    notifTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
};

window.closeChatNotification = function(event) {
    if (event) event.stopPropagation(); // Prevent opening the chat panel
    
    const toast = document.getElementById('chat-notification-toast');
    if (toast) {
        toast.classList.remove('show');
    }
    if (notifTimeout) {
        clearTimeout(notifTimeout);
        notifTimeout = null;
    }
};

window.openChatFromNotification = function() {
    closeChatNotification();
    if (!isChatOpen) {
        toggleChatWindow();
    }
};

// Dynamic Partner Active Status Indicator
function updatePartnerStatusUI() {
    const partner = window.currentUser === 'GF' ? 'BF' : 'GF';
    const statusDot = document.getElementById('chat-partner-status-dot');
    const partnerNameText = document.getElementById('chat-partner-name-text');
    
    if (!statusDot || !partnerNameText) return;
    
    const stats = window.competitionStats ? window.competitionStats[partner] : null;
    const isOnline = stats ? stats.active : false;
    
    if (isOnline) {
        statusDot.classList.add('active');
        const subjectLabel = stats.subject ? ` (studying ${stats.subject} ⚡)` : ' (online)';
        partnerNameText.textContent = getPartnerDisplayName(partner) + subjectLabel;
    } else {
        statusDot.classList.remove('active');
        partnerNameText.textContent = getPartnerDisplayName(partner) + ' (offline)';
    }
}

// Initialize Real-Time Chat Sync Listener
function initChatSync() {
    const chatDocRef = window.db.collection('study_data').doc('chat');
    
    chatDocRef.onSnapshot((doc) => {
        if (!doc.exists) {
            console.log("Chat history document does not exist. Initializing empty collection...");
            chatDocRef.set({ messages: [] }, { merge: true });
            return;
        }
        
        const data = doc.data();
        const incomingMessages = data.messages || [];
        
        // Detect if a new message was added by the other user
        const lastIncoming = incomingMessages[incomingMessages.length - 1];
        const lastCurrent = chatMessages[chatMessages.length - 1];
        
        chatMessages = incomingMessages;
        renderChatHistory();
        
        if (lastIncoming && (!lastCurrent || lastIncoming.timestamp !== lastCurrent.timestamp)) {
            // A new message has arrived
            if (lastIncoming.sender !== window.currentUser) {
                // If message timestamp is newer than our last read time, trigger notification/badge
                if (lastIncoming.timestamp > lastReadTimestamp) {
                    if (!isChatOpen) {
                        const badge = document.getElementById('chat-unread-badge');
                        if (badge) badge.classList.add('show');
                        window.showChatNotification(lastIncoming.sender, lastIncoming.text);
                    } else {
                        // If chat is open, immediately mark as read
                        lastReadTimestamp = Date.now();
                        localStorage.setItem('mocks_chat_last_read_time', lastReadTimestamp);
                        playChatChime(); // Play simple sound even if chat is open to signal receipt
                    }
                }
            }
        }
    }, (error) => {
        console.error("Firestore chat listener failed:", error);
    });
    
    // Set up status checker interval (every 10 seconds)
    setInterval(updatePartnerStatusUI, 10000);
}

// Hook into profile updates and loaded states
document.addEventListener('DOMContentLoaded', () => {
    updateSoundBtnUI();
    
    // Wait a brief moment to ensure Firebase is fully loaded
    setTimeout(() => {
        initChatSync();
        updatePartnerStatusUI();
    }, 1000);
});

// Wait for window to load completely (after app.js DOMContentLoaded sets window.triggerUIUpdates)
window.addEventListener('load', () => {
    const originalTriggerUIUpdates = window.triggerUIUpdates;
    window.triggerUIUpdates = function() {
        if (typeof originalTriggerUIUpdates === 'function') {
            originalTriggerUIUpdates();
        }
        updatePartnerStatusUI();
    };
});
