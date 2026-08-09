document.addEventListener("DOMContentLoaded", function () {
	const maxSizeForImage = 5 * 1024 * 1024;
	const maxSizeForVideo = 10 * 1024 * 1024;
	
    const form = document.getElementById("complaintForm");

    const nameInput = document.getElementById("fullname");
    const phoneInput = document.getElementById("phone");
    const adviceInput = document.getElementById("advice");
    const complaintInput = document.getElementById("complaint");
    const adressInput = document.getElementById("adress");
    const imageInput = document.getElementById("image");
    const videoInput = document.getElementById("video");

    const phoneError = document.getElementById("phoneError");


    function showMessage(msg, error = true) {
        var color = error ? "#d93025" : "#727272";
		const flashMessage = document.getElementById("flashMessage");
        flashMessage.textContent = msg;
        flashMessage.style.backgroundColor = color;
        flashMessage.style.display = "block";
        flashMessage.classList.add("show");

        setTimeout(() => {
            flashMessage.classList.remove("show");
            setTimeout(() => {
                flashMessage.style.display = "none";
            }, 3000);
        }, 3000);
    }

    // Create loading modal function
    function createLoadingModal() {
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'loading-modal';
        modal.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.5);
			display: none;
			justify-content: center;
			align-items: center;
			z-index: 9999;
		`;

        // Create spinner
        const spinner = document.createElement('div');
        spinner.style.cssText = `
			width: 50px;
			height: 50px;
			border: 5px solid #b8a678;
			border-top: 5px solid #054239;
			border-radius: 50%;
			animation: spin 1s linear infinite;
		`;

        // Create loading text
        const text = document.createElement('div');
        text.textContent = 'جاري التحميل...';
        text.style.cssText = `
			color: white;
			margin-top: 20px;
			font-size: 16px;
			font-family: Arial, sans-serif;
		`;

        // Create content wrapper
        const content = document.createElement('div');
        content.style.cssText = `
			display: flex;
			flex-direction: column;
			align-items: center;
		`;

        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
			@keyframes spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
		`;

        // Assemble the modal
        content.appendChild(spinner);
        content.appendChild(text);
        modal.appendChild(content);
        document.head.appendChild(style);
        document.body.appendChild(modal);

        return {
            show: function (message = 'جاري التحميل...') {
                text.textContent = message;
                modal.style.display = 'flex';
            },
            hide: function () {
                modal.style.display = 'none';
            }
        };
    }

    // Create and export the modal instance
    const loadingModal = createLoadingModal();

    phoneInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
        phoneError.style.display = "none";
    });

    const adviceBtn = document.getElementById('addAdviceBtn');
    const adviceFieldContainer = document.getElementById('adviceFieldContainer');
    const adviceTextArea = document.getElementById('advice');

    adviceBtn.addEventListener('click', function () {
        var currentDisplay = adviceFieldContainer.style.display;
        var display = currentDisplay === 'none' ? 'block' : 'none';
        adviceFieldContainer.style.display = display;
        if (display === 'block') {
            adviceBtn.textContent = 'إخفاء التوصية';
        } else {
            adviceBtn.textContent = 'اكتب توصية أو نصيحة';
            adviceTextArea.value = '';
        }
    });

    //history.replaceState({}, '', window.location.origin);

    imageInput.addEventListener('change', handleImageSelect);
    videoInput.addEventListener('change', handleVideoSelect);

    const imageName = document.getElementById('imageName');
    const videoName = document.getElementById('videoName');
    const imageSize = document.getElementById('imageSize');
    const videoSize = document.getElementById('videoSize');

    // Preview elements
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewImg = document.getElementById('imagePreviewImg');
    const videoPreview = document.getElementById('videoPreview');
    const videoPreviewPlayer = document.getElementById('videoPreviewPlayer');

    let selectedImage = null;
    function handleImageSelect(event) {
        const file = event.target.files[0];
		if (!file || !file.type.startsWith('image/')) {
			var msg = 'الملف غير صالح، يرجى اختيار صورة';
			selectedImage = null;
			imageInput.value = '';
			imageName.textContent = msg;
			imageSize.textContent = '';
			imagePreview.style.display = 'none';
			event.target.value = '';
			showMessage(msg);
			return;
	    }
		
		if (file.size > maxSizeForImage) {
			selectedImage = null;
			imageInput.value = '';
			imageName.textContent = 'حجم الصورة كبير، يرجى اختيار صورة بحجم أصغر من 5 ميغابايب';
			imageSize.textContent = '';
			imagePreview.style.display = 'none';
			event.target.value = '';
			return;
        }

        selectedImage = file;
        imageName.textContent = file.name;
        imageSize.textContent = formatFileSize(file.size);

        // Show preview
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreviewImg.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    let selectedVideo = null;
    async function handleVideoSelect(event) {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('video/')) {
			var msg = 'الملف غير صالح، يرجى اختيار فديو';
			selectedVideo = null;
			videoInput.value = '';
			videoName.textContent = msg;
			videoSize.textContent = '';
			videoPreview.style.display = 'none';
			event.target.value = '';
			showMessage(msg);
			return;
	    }

        let compressedFile = file;
        if (file.size > maxSizeForVideo) {
            try {
                loadingModal.show('جارٍ ضغط الفيديو...');
                compressedFile = await compressVideo(file);

                // If still too large after compression
                if (compressedFile.size > maxSizeForVideo) {
                    selectedVideo = null;
                    videoInput.value = '';
                    videoName.textContent = 'حجم ملف الفيديو كبير جداً حتى بعد الضغط';
                    videoSize.textContent = '';
                    videoPreview.style.display = 'none';
					event.target.value = '';
                    return;
                }

                loadingModal.show('تم الضغط بنجاح');
                loadingModal.hide();
            } catch (error) {
                console.error('Compression failed:', error);
                showMessage('فشل الضغط، يرجى رفع ملف آخر');
				selectedVideo = null;
				videoInput.value = '';
				videoName.textContent = 'توجد مشكلة في الملف، يرجى اختيار فديو آخر';
				videoSize.textContent = '';
				videoPreview.style.display = 'none';
				event.target.value = '';
				return;
            }
        }

        selectedVideo = compressedFile;
        videoName.textContent = compressedFile.name;
        videoSize.textContent = formatFileSize(compressedFile.size);

        // Show preview
        const url = URL.createObjectURL(compressedFile);
        videoPreviewPlayer.src = url;
        videoPreview.style.display = 'block';
    }

	async function compressVideo2(file, options = {}) {
		options.onProgress = (p) => {console.log(p);};
		const {
			targetBitrate = 2000000, // 2 Mbps
			includeAudio = false,    // CRITICAL: Default to false to strip audio
			mimeType = 'video/webm;codecs=vp9',
			maxWidth = 1280,         // Optional resolution limit
			maxHeight = 720
		} = options;

		return new Promise((resolve, reject) => {
			// ===== CRITICAL FIXES =====
			const videoEl = document.createElement('video');
			videoEl.muted = true;          // 🔇 PREVENTS AUDIO PLAYBACK DURING COMPRESSION
			videoEl.playsInline = true;    // Prevents fullscreen on mobile
			videoEl.src = URL.createObjectURL(file);
			
			// Cleanup helper (avoids leaks on error)
			const cleanup = () => {
				if (videoEl.src) URL.revokeObjectURL(videoEl.src);
				videoEl.src = '';
				videoEl.remove();
			};

			// ===== MIME TYPE SAFETY =====
			let selectedMimeType = mimeType;
			if (!MediaRecorder.isTypeSupported(selectedMimeType)) {
				const fallbacks = [
					'video/webm;codecs=vp8',
					'video/webm',
					'video/mp4' // Rarely supported for recording, but check
				];
				for (const type of fallbacks) {
					if (MediaRecorder.isTypeSupported(type)) {
						console.warn(`Falling back to supported MIME type: ${type}`);
						selectedMimeType = type;
						break;
					}
				}
				if (!MediaRecorder.isTypeSupported(selectedMimeType)) {
					cleanup();
					return reject(new Error(`No supported codec. Tried: ${[mimeType, ...fallbacks].join(', ')}`));
				}
			}

			// ===== METADATA LOADED =====
			videoEl.onloadedmetadata = async () => {
				try {
					// ===== RESOLUTION SCALING (reduces encode load) =====
					const scaleWidth = Math.min(videoEl.videoWidth, maxWidth);
					const scaleHeight = Math.min(videoEl.videoHeight, maxHeight);
					const canvas = document.createElement('canvas');
					canvas.width = scaleWidth;
					canvas.height = scaleHeight;
					const ctx = canvas.getContext('2d', { alpha: false });
					
					// Create offscreen processing stream
					const canvasStream = canvas.captureStream(30); // 30fps target
					
					// ===== AUDIO HANDLING =====
					let finalStream = canvasStream;
					if (includeAudio) {
						// Only add audio if explicitly requested AND exists
						const audioContext = new (window.AudioContext || window.webkitAudioContext)();
						const source = audioContext.createMediaElementSource(videoEl);
						const dest = audioContext.createMediaStreamDestination();
						source.connect(dest);
						source.connect(audioContext.destination); // Required for some browsers
						
						// Combine canvas video + audio stream
						finalStream = new MediaStream([
							...canvasStream.getVideoTracks(),
							...dest.stream.getAudioTracks()
						]);
						
						// Cleanup audio context later
						finalStream.audioContext = audioContext; // Attach for cleanup
					}

					// ===== MEDIA RECORDER SETUP =====
					const mediaRecorder = new MediaRecorder(finalStream, {
						mimeType: selectedMimeType,
						videoBitsPerSecond: targetBitrate,
						...(includeAudio && { audioBitsPerSecond: 128000 })
					});

					const chunks = [];
					let processedFrames = 0;
					const totalFrames = Math.floor(videoEl.duration * 30); // Approx @30fps

					// Optional: Add progress callback if needed
					if (options.onProgress) options.onProgress(0);

					mediaRecorder.ondataavailable = e => e.data.size && chunks.push(e.data);
					
					mediaRecorder.onstop = () => {
						try {
							// Cleanup streams
							finalStream.getTracks().forEach(t => t.stop());
							if (finalStream.audioContext) finalStream.audioContext.close();
							
							const blob = new Blob(chunks, { type: selectedMimeType.split(';')[0] || 'video/webm' });
							const compressedFile = new File(
								[blob], 
								`compressed_${file.name.replace(/\.[^/.]+$/, '')}.webm`, 
								{ type: blob.type, lastModified: Date.now() }
							);
							
							cleanup();
							resolve(compressedFile);
						} catch (e) {
							cleanup();
							reject(e);
						}
					};
					
					mediaRecorder.onerror = e => {
						cleanup();
						reject(new Error(`Encoding failed: ${e.error || 'Unknown error'}`));
					};

					// ===== FRAME PROCESSING (NON-REALTIME ATTEMPT) =====
					mediaRecorder.start();
					
					// Draw frames as fast as possible (bypasses real-time playback!)
					const processFrame = () => {
						if (videoEl.currentTime >= videoEl.duration) {
							videoEl.pause();
							mediaRecorder.stop();
							return;
						}
						
						// Scale while drawing
						ctx.drawImage(
							videoEl, 
							0, 0, videoEl.videoWidth, videoEl.videoHeight,
							0, 0, scaleWidth, scaleHeight
						);
						
						processedFrames++;
						if (options.onProgress) options.onProgress(processedFrames / totalFrames);
						
						// Schedule next frame IMMEDIATELY (not tied to real-time)
						requestAnimationFrame(processFrame);
					};
					
					// Start processing
					videoEl.play().catch(e => {
						cleanup();
						reject(new Error(`Playback failed: ${e.message}`));
					});
					requestAnimationFrame(processFrame);
					
				} catch (e) {
					cleanup();
					reject(e);
				}
			};
			
			videoEl.onerror = () => {
				cleanup();
				reject(new Error('Video failed to load'));
			};
		});
	}

    async function compressVideo(file, targetBitrate = 2000000) { // 2 mbps
        return new Promise((resolve, reject) => {
            // Create video element to read the file
            const videoEl = document.createElement('video');
			videoEl.autoplay = false;
            videoEl.src = URL.createObjectURL(file);

            // Wait for video metadata to load
            videoEl.onloadedmetadata = async () => {
                // Create MediaRecorder to re-encode the video
                const stream = videoEl.captureStream();
                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp9',
                    videoBitsPerSecond: targetBitrate
                });

                const chunks = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        chunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    // Create compressed blob from all chunks
                    const compressedBlob = new Blob(chunks, {
                        type: 'video/webm'
                    });

                    const compressedFile = new File([compressedBlob], file.name, {
                        type: 'video/webm',
                        lastModified: Date.now()
                    });

                    // Clean up
                    stream.getTracks().forEach(track => track.stop());
                    URL.revokeObjectURL(videoEl.src);

                    resolve(compressedFile);
                };

                mediaRecorder.onerror = (event) => {
                    reject(new Error(`MediaRecorder error: ${event.error}`));
                };

                // Start recording/compression
                mediaRecorder.start();

                // Play video to process all frames
				videoEl.muted = true;
                videoEl.play().then(() => {
                    // Stop when video ends
                    videoEl.onended = () => {
                        mediaRecorder.stop();
                    };
                }).catch(reject);
            };

            videoEl.onerror = () => {
                reject(new Error('Failed to load video'));
            };
        });
    }


    function formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }


    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let hasError = false;

        const fullname = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const adress = adressInput.value.trim();
        const complaint = complaintInput.value.trim();


        const imageFile = imageInput.files[0];
        const videoFile = selectedVideo;

        //const complaintType = document.getElementById('complaintType');
        const complaintType = document.querySelector('input[name="C"]:checked');
        const aboutValue = complaintType ? complaintType.value : "";

        const advice = adviceInput.value.trim();
        const recommendation_ckeked = advice ? true : false;


        if (!aboutValue) {
            hasError = true;
			showMessage('يرجى اختيار نوع الشكوى');
        }

        if (hasError)
            return;

        const data = {
            "FULL_NAME": fullname,
            "CONTACT_NUMBER": phone,
            "COMPLAINT_CLASSIFICATION": Number(aboutValue),
            "ADDRESS": adress,
            "SUBJECT_OF_COMPLAINT": complaint,
            "RECOMMENDATION_CHECK": recommendation_ckeked,
            "RECOMMENDATION": advice
        };

        function createProgressItem(fileSize) {
            const item = document.createElement('div');
            item.className = 'upload-item';
            item.innerHTML = `
			<div class="upload-header">
				<span class="upload-percent">0%</span>
			</div>
			<div class="progress-bar">
				<div class="progress-fill"></div>
			</div>
			<div class="upload-details">
				<span class="upload-progress">0 KB of ${(fileSize / 1024).toFixed(2)} KB</span>
				<span class="upload-speed">-- KB/s</span>
			</div>
		`;
            uploadItems.appendChild(item);
        }

        function calculateUploadSpeed(event) {
            if (!event.timeStamp || !window.lastUploadTime) {
                window.lastUploadTime = event.timeStamp;
                window.lastUploadLoaded = event.loaded;
                return null;
            }

            const timeDiff = (event.timeStamp - window.lastUploadTime) / 1000; // in seconds
            const loadedDiff = event.loaded - window.lastUploadLoaded; // in bytes

            if (timeDiff > 0) {
                const speedKBps = (loadedDiff / 1024) / timeDiff;

                window.lastUploadTime = event.timeStamp;
                window.lastUploadLoaded = event.loaded;

                return speedKBps.toFixed(2);
            }

            return null;
        }

        let uploadInProgress = false;
        async function handleSubmit() {
            if (uploadInProgress)
                return;

            /*const phoneRegex = /^09\d{8}$/;
            if (!phoneRegex.test(phone)) {
                showMessage("رقم الهاتف غير صالح");
                return false;
            }*/

            // Validate video size
            if (videoFile && videoFile.size > 15 * 1024 * 1024) {
                showMessage("حجم الفيديو يجب أن يكون 15MB على الأكثر");
                return;
            }

            try {
                loadingModal.show('جاري إرسال الشكوى');
                uploadInProgress = true;
                var submitBtn = document.getElementById('send');
                submitBtn.disabled = true;
                submitBtn.value = 'جاري الإرسال...';

                // Create form data
                const formData = new FormData();

                // Add JSON data as a parameter
                formData.append('data', JSON.stringify(data));

                // Add files
                if (imageFile) {
					let ext = imageFile.name.split('.').pop();
                    formData.append('COMPLAINT_PIC.' + ext, imageFile);
                }
                if (videoFile) {
					let ext = videoFile.name.split('.').pop();
                    formData.append('COMPLAINT_VIDEO.' + ext, videoFile);
                }

                // Show progress container
                var progressContainer = document.getElementById('progressContainer');
                progressContainer.style.display = 'block';
                var uploadItems = document.getElementById('uploadItems');
                uploadItems.innerHTML = '';

                var size = 0;
                // Create progress items
                const uploads = [];
                if (imageFile) {
                    uploads.push({
                        name: imageFile.name,
                        type: 'image',
                        size: imageFile.size
                    });

                    size += imageFile.size;
                }
                if (videoFile) {
                    uploads.push({
                        name: videoFile.name,
                        type: 'video',
                        size: videoFile.size
                    });

                    size += videoFile.size;
                }

                // Add progress to UI
                if (size > 0)
                    createProgressItem(size);

                // Calculate total size
                const totalSize = uploads.reduce((sum, upload) => sum + upload.size, 0);

                // Upload using XMLHttpRequest to track progress
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', function (event) {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;

                        // Update overall progress
                        const totalProgress = Math.round(percentComplete);
                        const uploadedMB = (event.loaded / (1024 * 1024)).toFixed(2);
                        const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

                        // Calculate speed
                        const speed = calculateUploadSpeed(event);

                        // Update UI
                        document.querySelectorAll('.upload-percent').forEach(el => {
                            el.textContent = `${totalProgress}%`;
                        });

                        document.querySelectorAll('.upload-progress').forEach(el => {
                            el.textContent = `${uploadedMB} MB of ${totalMB} MB`;
                        });

                        if (speed) {
                            document.querySelectorAll('.upload-speed').forEach(el => {
                                el.textContent = `${speed} KB/s`;
                            });
                        }

                        // Update progress bars
                        document.querySelectorAll('.progress-fill').forEach(bar => {
                            bar.style.width = `${totalProgress}%`;
                        });
                    }
                });

                xhr.addEventListener('load', function () {
                    if (xhr.status === 200) {
						const retJson = JSON.parse(this.responseText);
						if (retJson.error) {
							showMessage(retJson.error, true);
						} else {
							form.reset();
							var progressContainer = document.getElementById('progressContainer');
							progressContainer.style.display = 'none';

							var no = retJson.no ?? '';
							window.location.href = 'comp-success.html?' + no;
						}

//					showMessage("تم إرسال الشكوى بنجاح، شكراً لاستخدامكم هذه الخدمة", false);
                    } else {
                        showMessage("حدث خطأ أثناء الإرسال");
                    }

                    loadingModal.hide();
                    uploadInProgress = false;
                    submitBtn.disabled = false;
                    submitBtn.value = 'إرسال';
                });

                xhr.addEventListener('error', function () {
                    showMessage("حدث خطأ أثناء الإرسال، تأكد من اتصال الشبكة");

                    loadingModal.hide();
                    uploadInProgress = false;
                    submitBtn.disabled = false;
                    submitBtn.value = 'إرسال';
                });

                xhr.addEventListener('abort', function () {
                    showMessage("تم إلغاء الإرسال");

                    loadingModal.hide();
                    uploadInProgress = false;
                    submitBtn.disabled = false;
                    submitBtn.value = 'إرسال';
                });

                // Send request
                xhr.open('POST', '/Bwork/BworkServlet', true);
                xhr.setRequestHeader('ContentType', 'multipart/form-data;charset=utf-8;');
                xhr.setRequestHeader('ps-action', 'PSDGovFastComplaint');

                xhr.send(formData);

            } catch (error) {
                console.error('Upload error:', error);
                showMessage("حصل خطأ غير متوقع، يرجى المحاولة لاحقاً");

                loadingModal.hide();
                uploadInProgress = false;
                submitBtn.disabled = false;
                submitBtn.textContent = 'Upload Files';
            }
        }

        handleSubmit();

    });
});