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

    window.renderMistakes = function() {
        if (!mistakesList) return;
        const searchQuery = searchMistakesInput ? searchMistakesInput.value.toLowerCase().trim() : '';
        const filterSubject = filterMistakeSubject ? filterMistakeSubject.value : 'all';
        
        const filteredMistakes = window.mistakes.filter(m => {
            const matchesSearch = m.topic.toLowerCase().includes(searchQuery) || 
                                  m.desc.toLowerCase().includes(searchQuery) ||
                                  m.action.toLowerCase().includes(searchQuery);
            const matchesFilter = (filterSubject === 'all' || m.subject === filterSubject);
            return matchesSearch && matchesFilter;
        });

        if (filteredMistakes.length === 0) {
            mistakesList.innerHTML = `
                <div class="mistake-card" style="border-left-color: var(--exam-color); padding: 1.5rem;">
                    <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                        No mistakes found. Add your first mistake or clear filters! 🛡️
                    </div>
                </div>
            `;
            return;
        }

        mistakesList.innerHTML = filteredMistakes.map((m) => {
            const originalIndex = window.mistakes.indexOf(m);
            return `
                <div class="mistake-card ${m.subject}">
                    <div class="mistake-header">
                        <span class="mistake-topic">${escapeHtml(m.topic)}</span>
                        <button class="delete-mistake-btn" onclick="deleteMistake(${originalIndex})">✕</button>
                    </div>
                    <div class="mistake-desc"><strong>Mistake:</strong> ${escapeHtml(m.desc)}</div>
                    <div class="mistake-action"><strong>Rule:</strong> ${escapeHtml(m.action)}</div>
                    ${m.imageUrl ? `
                    <div class="mistake-card-image-container" onclick="openLightbox('${escapeHtml(m.imageUrl)}')">
                        <img src="${escapeHtml(m.imageUrl)}" class="mistake-card-image" alt="Mistake Attachment" loading="lazy">
                    </div>` : ''}
                </div>
            `;
        }).join('');
    };

    window.deleteMistake = function(index) {
        if (window.isUpdatingFromFirestore) return;
        if (confirm("Are you sure you want to delete this mistake log?")) {
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
                
                const newMistake = { subject, topic, desc, action };
                if (imageUrl) {
                    newMistake.imageUrl = imageUrl;
                }
                
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
