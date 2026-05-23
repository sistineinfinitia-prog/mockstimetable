/* js/components/mistakes-log.js */

document.addEventListener('DOMContentLoaded', () => {
    // 7. Mistakes Log Components & Image Support
    const mistakeForm = document.getElementById('mistake-form');
    const mistakesList = document.getElementById('mistakes-list');
    const searchMistakesInput = document.getElementById('search-mistakes');
    const filterMistakeSubject = document.getElementById('filter-mistake-subject');
    
    // Image Handling Elements
    const imageZone = document.getElementById('mistake-image-zone');
    const imageInput = document.getElementById('mistake-image-input');
    const imagePreviewContainer = document.getElementById('mistake-image-preview-container');
    const imagePreview = document.getElementById('mistake-image-preview');
    const btnRemoveImage = document.getElementById('btn-remove-mistake-image');
    let currentImageBase64 = null;

    // Helper for escaping HTML
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Attach click listener to image upload zone
    if (imageZone && imageInput) {
        imageZone.addEventListener('click', () => {
            imageInput.click();
        });

        // Handle file select
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                await handleImageSelection(file);
            }
        });

        // Drag & Drop
        imageZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageZone.classList.add('dragover');
        });

        imageZone.addEventListener('dragleave', () => {
            imageZone.classList.remove('dragover');
        });

        imageZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            imageZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                await handleImageSelection(file);
            }
        });

        // Clipboard Paste Listener (Pasted screenshots)
        document.addEventListener('paste', async (e) => {
            // Only process paste if mistakes tab is active
            const mistakesTab = document.getElementById('tab-mistakes');
            if (!mistakesTab || !mistakesTab.classList.contains('active')) {
                return;
            }
            
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (const item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    await handleImageSelection(file);
                    e.preventDefault();
                    break;
                }
            }
        });
    }

    async function handleImageSelection(file) {
        try {
            if (imageZone) {
                const uploadText = imageZone.querySelector('.upload-text');
                if (uploadText) uploadText.textContent = '⚡ Compressing image...';
            }
            
            // Compress to maximum 800px width/height, 0.7 quality
            const dataUrl = await compressImage(file, 800, 800, 0.7);
            currentImageBase64 = dataUrl;
            
            // Show preview
            if (imagePreview) imagePreview.src = dataUrl;
            if (imagePreviewContainer) imagePreviewContainer.style.display = 'block';
            if (imageZone) imageZone.style.display = 'none';
        } catch (err) {
            console.error("Image processing failed:", err);
            alert("Failed to process image. Please try again.");
            resetImageUpload();
        }
    }

    window.resetImageUpload = function() {
        currentImageBase64 = null;
        if (imageInput) imageInput.value = '';
        if (imagePreview) imagePreview.src = '';
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
        if (imageZone) {
            imageZone.style.display = 'flex';
            const uploadText = imageZone.querySelector('.upload-text');
            if (uploadText) uploadText.textContent = 'Drag & drop, paste, or click to upload';
        }
    };

    if (btnRemoveImage) {
        btnRemoveImage.addEventListener('click', (e) => {
            e.stopPropagation();
            resetImageUpload();
        });
    }

    // Canvas Downscaling & Compression Helper
    function compressImage(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to JPEG format with 70% quality to minimize file size
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // Firebase Storage Upload Helper
    async function uploadImageToStorage(base64Data, filename) {
        if (!window.storage) throw new Error("Firebase Storage not initialized");
        
        const res = await fetch(base64Data);
        const blob = await res.blob();
        
        const storageRef = window.storage.ref();
        const fileRef = storageRef.child(`mistakes/${window.currentUser}/${Date.now()}_${filename}`);
        await fileRef.put(blob);
        return await fileRef.getDownloadURL();
    }

    // Lightbox Global Methods
    window.openLightbox = function(url) {
        const lightbox = document.getElementById('lightbox-modal');
        const img = document.getElementById('lightbox-image');
        if (lightbox && img) {
            img.src = url;
            lightbox.classList.add('active');
        }
    };

    window.closeLightbox = function() {
        const lightbox = document.getElementById('lightbox-modal');
        if (lightbox) {
            lightbox.classList.remove('active');
        }
    };

    window.saveMistakes = function() {
        const storagePrefix = window.currentUser + '_';
        localStorage.setItem(storagePrefix + 'mistakes', JSON.stringify(window.mistakes));
        window.pushStateToFirestore();
    };

    window.currentMistakesTab = 'undone';
    window.activePopupMistakeIndex = null;

    window.switchMistakeTab = function(tabId) {
        if (typeof window.playInteractionSound === 'function') window.playInteractionSound('tab');
        window.currentMistakesTab = tabId;
        
        const undoneBtn = document.getElementById('mistake-tab-undone');
        const doneBtn = document.getElementById('mistake-tab-done');
        if (undoneBtn && doneBtn) {
            if (tabId === 'undone') {
                undoneBtn.classList.add('active');
                doneBtn.classList.remove('active');
            } else {
                undoneBtn.classList.remove('active');
                doneBtn.classList.add('active');
            }
        }
        window.renderMistakes();
    };

    window.toggleMistakeResolved = function(index, event) {
        if (event) event.stopPropagation();
        if (window.isUpdatingFromFirestore) return;
        
        const m = window.mistakes[index];
        if (m) {
            m.resolved = !m.resolved;
            if (typeof window.playInteractionSound === 'function') window.playInteractionSound('check');
            window.saveMistakes();
            window.renderMistakes();
            
            // Refresh modal if open on current index
            if (window.activePopupMistakeIndex === index) {
                window.openMistakeModal(index);
            }
        }
    };

    window.openMistakeModal = function(index) {
        if (typeof window.playInteractionSound === 'function') window.playInteractionSound('click');
        window.activePopupMistakeIndex = index;
        
        const modal = document.getElementById('mistake-detail-modal');
        const body = document.getElementById('mistake-modal-body');
        if (!modal || !body) return;
        
        const m = window.mistakes[index];
        if (!m) return;
        
        body.innerHTML = `
            <div class="mistake-header" style="margin-bottom: 1.2rem;">
                <span class="tag ${m.subject}">${window.getSubjectLabel ? window.getSubjectLabel(m.subject) : m.subject}</span>
                <h3 style="font-family: 'Outfit'; font-size: 1.25rem; margin: 0.5rem 0 0 0; color: var(--text-main);">${escapeHtml(m.topic)}</h3>
            </div>
            
            <div style="margin-bottom: 1.2rem;">
                <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.4rem; letter-spacing: 0.5px;">🔍 The Mistake / Gap</h4>
                <p style="font-size: 0.95rem; color: var(--text-main); margin: 0; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(m.desc)}</p>
            </div>
            
            ${m.imageUrl ? `
            <div style="margin-bottom: 1.2rem;">
                <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.4rem; letter-spacing: 0.5px;">📷 Attachment</h4>
                <div class="mistake-card-image-container" onclick="window.openLightbox('${escapeHtml(m.imageUrl)}')" style="max-height: 200px;">
                    <img src="${escapeHtml(m.imageUrl)}" style="width: 100%; height: 100%; object-fit: contain;" alt="Mistake Attachment">
                </div>
            </div>` : ''}
            
            <div style="margin-bottom: 1.5rem;" id="solution-container">
                <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.4rem; letter-spacing: 0.5px;">🛡️ Correct General Rule</h4>
                <div class="solution-cover" onclick="window.revealMistakeSolution(${index})">
                    <div class="solution-cover-title">Click to Reveal Actionable Solution Rule</div>
                    <button class="reveal-btn">👀 Reveal Solution</button>
                </div>
            </div>
            
            <div style="display: flex; gap: 0.8rem; border-top: 1px solid var(--card-border); padding-top: 1.2rem; margin-top: 1.5rem;">
                <button class="btn-primary" onclick="window.toggleMistakeResolved(${index})" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0.6rem 1rem; font-size: 0.85rem; background: ${m.resolved ? 'var(--text-muted)' : 'linear-gradient(135deg, #2ed573, #26af56)'}; box-shadow: none;">
                    ${m.resolved ? '🔄 Re-open Mistake' : '✅ Mark Reviewed'}
                </button>
                <button class="btn-primary" onclick="window.deleteMistake(${index}); window.closeMistakeModal();" style="width: 120px; padding: 0.6rem 1rem; font-size: 0.85rem; background: linear-gradient(135deg, var(--math-color), #ff4757); box-shadow: none;">
                    ✕ Delete
                </button>
            </div>
        `;
        
        modal.classList.add('active');
    };

    window.revealMistakeSolution = function(index) {
        if (typeof window.playInteractionSound === 'function') window.playInteractionSound('check');
        const container = document.getElementById('solution-container');
        if (!container) return;
        
        const m = window.mistakes[index];
        if (!m) return;
        
        container.innerHTML = `
            <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.4rem; letter-spacing: 0.5px;">🛡️ Correct General Rule</h4>
            <div class="mistake-action solution-revealed" style="margin-top: 0.5rem;">
                <strong>Rule:</strong> ${escapeHtml(m.action)}
            </div>
        `;
    };

    window.closeMistakeModal = function() {
        if (typeof window.playInteractionSound === 'function') window.playInteractionSound('click');
        const modal = document.getElementById('mistake-detail-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        window.activePopupMistakeIndex = null;
    };

    window.renderMistakes = function() {
        if (!mistakesList) return;
        const searchQuery = searchMistakesInput ? searchMistakesInput.value.toLowerCase().trim() : '';
        const filterSubject = filterMistakeSubject ? filterMistakeSubject.value : 'all';
        const targetTab = window.currentMistakesTab || 'undone';
        
        const filteredMistakes = window.mistakes.filter(m => {
            const isResolved = !!m.resolved;
            const matchesTab = (targetTab === 'done' ? isResolved === true : isResolved === false);
            
            const matchesSearch = m.topic.toLowerCase().includes(searchQuery) || 
                                  m.desc.toLowerCase().includes(searchQuery) ||
                                  m.action.toLowerCase().includes(searchQuery);
            const matchesFilter = (filterSubject === 'all' || m.subject === filterSubject);
            return matchesTab && matchesSearch && matchesFilter;
        });

        if (filteredMistakes.length === 0) {
            mistakesList.innerHTML = `
                <div class="mistake-card" style="border-left-color: var(--exam-color); padding: 1.5rem;">
                    <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                        No ${targetTab === 'done' ? 'reviewed' : 'undone'} mistakes found. 🛡️
                    </div>
                </div>
            `;
            return;
        }

        mistakesList.innerHTML = filteredMistakes.map((m) => {
            const originalIndex = window.mistakes.indexOf(m);
            return `
                <div class="mistake-summary-row ${m.subject}" onclick="window.openMistakeModal(${originalIndex})">
                    <div style="display: flex; align-items: center; gap: 8px; flex-grow: 1; overflow: hidden;">
                        <span class="tag ${m.subject}" style="margin: 0; padding: 0.15rem 0.5rem; font-size: 0.75rem;">
                            ${window.getSubjectLabel ? window.getSubjectLabel(m.subject) : m.subject}
                        </span>
                        <span class="mistake-topic" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; font-size: 0.85rem;">
                            ${escapeHtml(m.topic)}
                        </span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;" onclick="event.stopPropagation()">
                        <button class="resolve-mistake-btn" onclick="window.toggleMistakeResolved(${originalIndex}, event)" title="${m.resolved ? 'Re-open' : 'Mark Reviewed'}">
                            ${m.resolved ? '🔄' : '✅'}
                        </button>
                        <button class="delete-mistake-btn" onclick="window.deleteMistake(${originalIndex})">✕</button>
                    </div>
                </div>
            `;
        }).join('');
    };

    window.deleteMistake = function(index) {
        if (window.isUpdatingFromFirestore) return;
        if (confirm("Are you sure you want to delete this mistake log?")) {
            if (typeof window.playInteractionSound === 'function') window.playInteractionSound('click');
            window.mistakes.splice(index, 1);
            window.saveMistakes();
            window.renderMistakes();
        }
    };

    if (mistakeForm) {
        mistakeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (window.isUpdatingFromFirestore) return;
            
            const submitBtn = mistakeForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Add to Mistakes Log 📓';
            
            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = 'Saving Mistake...';
                }
                
                const subject = document.getElementById('mistake-subject').value;
                const topic = document.getElementById('mistake-topic').value.trim();
                const desc = document.getElementById('mistake-desc').value.trim();
                const action = document.getElementById('mistake-action').value.trim();
                
                if (!topic || !desc || !action) {
                    alert("Please fill in all mistake log details!");
                    return;
                }

                let imageUrl = null;
                if (currentImageBase64) {
                    try {
                        if (window.storage) {
                            imageUrl = await uploadImageToStorage(currentImageBase64, 'mistake.jpg');
                        } else {
                            imageUrl = currentImageBase64;
                        }
                    } catch (storageErr) {
                        console.warn("Firebase Storage failed, falling back to base64 direct database write:", storageErr);
                        imageUrl = currentImageBase64;
                    }
                }
                
                const newMistake = { subject, topic, desc, action, resolved: false };
                if (imageUrl) {
                    newMistake.imageUrl = imageUrl;
                }
                
                if (typeof window.playInteractionSound === 'function') window.playInteractionSound('check');
                window.mistakes.push(newMistake);
                window.saveMistakes();
                
                mistakeForm.reset();
                resetImageUpload();
                window.renderMistakes();
            } catch (err) {
                console.error("Error saving mistake:", err);
                alert("Error saving mistake. Please try again.");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    if (searchMistakesInput) {
        searchMistakesInput.addEventListener('input', window.renderMistakes);
    }
    if (filterMistakeSubject) {
        filterMistakeSubject.addEventListener('change', window.renderMistakes);
    }
});
