class ImageVectorizer {
    constructor() {
        this.apiCredentials = {
            apiId: 'vkn4n2fhddhthke',
            apiSecret: 'm7m9jai9f852lb1lopsa3mmod53d9hccdtajg8rt7fmsmjs729vc',
            authorization: 'Basic dmtuNG4yZmhkZGh0aGtlOm03bTlqYWk5Zjg1MmxiMWxvcHNhM21tb2Q1M2Q5aGNjZHRhamc4cnQ3Zm1zbWpzNzI5dmM='
        };
        
        this.currentFile = null;
        this.currentSvg = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadCreditBalance();
    }
    
    initializeElements() {
        // Get all DOM elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.fileInfo = document.getElementById('fileInfo');
        this.previewImage = document.getElementById('previewImage');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.vectorizeBtn = document.getElementById('vectorizeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        this.uploadSection = document.getElementById('uploadSection');
        this.processingSection = document.getElementById('processingSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.errorSection = document.getElementById('errorSection');
        
        this.svgPreview = document.getElementById('svgPreview');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.newImageBtn = document.getElementById('newImageBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.errorMessage = document.getElementById('errorMessage');
    }
    
    bindEvents() {
        // Upload area events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        
        // File input change
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Button events
        this.vectorizeBtn.addEventListener('click', this.vectorizeImage.bind(this));
        this.clearBtn.addEventListener('click', this.clearFile.bind(this));
        this.downloadBtn.addEventListener('click', this.downloadSvg.bind(this));
        this.newImageBtn.addEventListener('click', this.resetToUpload.bind(this));
        this.retryBtn.addEventListener('click', this.resetToUpload.bind(this));
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }
    
    processFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size must be less than 10MB.');
            return;
        }
        
        this.currentFile = file;
        this.displayFileInfo(file);
    }
    
    displayFileInfo(file) {
        // Show file details
        this.fileName.textContent = `File: ${file.name}`;
        this.fileSize.textContent = `Size: ${this.formatFileSize(file.size)}`;
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImage.src = e.target.result;
            this.fileInfo.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    clearFile() {
        this.currentFile = null;
        this.fileInput.value = '';
        this.fileInfo.style.display = 'none';
    }
    
    async vectorizeImage() {
        if (!this.currentFile) {
            this.showError('Please select an image first.');
            return;
        }
        
        this.showProcessing();
        
        try {
            // Convert file to base64
            const base64 = await this.fileToBase64(this.currentFile);
            
            // Call vectorization API
            const svgResult = await this.callVectorizationAPI(base64);
            
            if (svgResult) {
                this.currentSvg = svgResult;
                this.showResults(svgResult);
                // Refresh credit balance after successful vectorization
                await this.refreshCreditBalance();
            } else {
                throw new Error('Failed to vectorize image. Please try again.');
            }
            
        } catch (error) {
            console.error('Vectorization error:', error);
            this.showError(error.message || 'An error occurred during vectorization. Please try again.');
        }
    }
    
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data URL prefix to get just the base64 string
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    async callVectorizationAPI(base64Image) {
        console.log('🚀 Starting vectorization process via backend server...');
        
        // Create a test image for debugging
        const testImageSize = Math.round(base64Image.length * 0.75); // Approximate size in bytes
        console.log(`📷 Image size: ~${(testImageSize / 1024).toFixed(1)}KB`);
        
        try {
            // First, check if the backend server is running
            console.log('🔍 Checking backend server health...');
            const healthResponse = await fetch('/health');
            
            if (!healthResponse.ok) {
                throw new Error('Backend server is not responding. Please start the server with "npm start".');
            }
            
            const healthData = await healthResponse.json();
            console.log('✅ Backend server is healthy:', healthData);
            
            // Send the image to our backend server
            console.log('📤 Sending image to backend for processing...');
            const response = await fetch('/api/vectorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageData: base64Image
                })
            });
            
            const result = await response.json();
            console.log('📥 Backend response:', result);
            
            if (result.success && result.svg) {
                console.log(`✅ Vectorization successful via ${result.service}`);
                console.log(`📊 Original size: ${result.originalSize} bytes`);
                if (result.creditsCharged) {
                    console.log(`💰 Credits charged: ${result.creditsCharged}`);
                }
                
                // Store additional metadata
                this.lastVectorizationInfo = {
                    service: result.service,
                    creditsCharged: result.creditsCharged,
                    imageToken: result.imageToken,
                    timestamp: result.timestamp
                };
                
                return result.svg;
            } else {
                console.log('❌ Backend vectorization failed:', result.error);
                
                // Show the actual error message from vectorizer.ai
                const errorMsg = result.message || result.error || 'Backend processing failed';
                throw new Error(errorMsg);
            }
            
        } catch (error) {
            console.log('💥 Backend communication error:', error.message);
            
            // If we can't reach the backend, provide helpful guidance
            if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                return this.createAdvancedMockSVG(base64Image, 
                    'Cannot connect to backend server. Please run "npm install" then "npm start" in the vectorizer-tool directory.');
            } else {
                return this.createAdvancedMockSVG(base64Image, error.message);
            }
        }
    }
    
    createMockSVG(errorMessage = null) {
        // Create a simple mock SVG for demonstration purposes
        const message = errorMessage ? 'API Error' : 'Mock SVG';
        const subMessage = errorMessage ? 'Check credentials' : '(Demo Mode)';
        
        return `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="200" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
            <circle cx="150" cy="100" r="50" fill="${errorMessage ? '#dc3545' : '#667eea'}"/>
            <text x="150" y="105" text-anchor="middle" fill="white" font-family="Arial" font-size="14">
                ${message}
            </text>
            <text x="150" y="125" text-anchor="middle" fill="white" font-family="Arial" font-size="10">
                ${subMessage}
            </text>
            ${errorMessage ? `<text x="150" y="160" text-anchor="middle" fill="#666" font-family="Arial" font-size="8">
                ${errorMessage.substring(0, 40)}${errorMessage.length > 40 ? '...' : ''}
            </text>` : ''}
        </svg>`;
    }
    
    createAdvancedMockSVG(base64Image, errorMessage = null) {
        // Create a more sophisticated mock SVG that simulates vectorization
        const timestamp = new Date().toLocaleTimeString();
        const imageSize = Math.round(base64Image.length * 0.75 / 1024); // KB
        
        if (errorMessage) {
            return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="errorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ee5a52;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="400" height="300" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
                <rect x="50" y="50" width="300" height="200" fill="url(#errorGrad)" rx="10"/>
                <text x="200" y="120" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
                    ⚠️ API Integration Issue
                </text>
                <text x="200" y="145" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12">
                    Original image: ${imageSize}KB
                </text>
                <text x="200" y="165" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12">
                    Processed at: ${timestamp}
                </text>
                <text x="200" y="190" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10">
                    Check browser console for detailed logs
                </text>
                <text x="200" y="210" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10">
                    ${errorMessage.substring(0, 50)}${errorMessage.length > 50 ? '...' : ''}
                </text>
            </svg>`;
        }
        
        // Create a demo vectorized result
        return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="demoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e9ecef" stroke-width="1"/>
                </pattern>
            </defs>
            
            <!-- Background -->
            <rect width="400" height="300" fill="url(#grid)"/>
            
            <!-- Main shape (simulating vectorized content) -->
            <circle cx="200" cy="150" r="80" fill="url(#demoGrad)" opacity="0.8"/>
            <polygon points="150,100 250,100 220,180 180,180" fill="#f093fb" opacity="0.7"/>
            <rect x="160" y="120" width="80" height="60" fill="#4facfe" opacity="0.6" rx="10"/>
            
            <!-- Decorative elements -->
            <path d="M 100 50 Q 200 20 300 50 T 350 100" stroke="#ff6b6b" stroke-width="3" fill="none"/>
            <circle cx="100" cy="80" r="15" fill="#feca57"/>
            <circle cx="300" cy="220" r="20" fill="#48dbfb"/>
            <circle cx="350" cy="100" r="12" fill="#ff9ff3"/>
            
            <!-- Info text -->
            <text x="200" y="280" text-anchor="middle" fill="#495057" font-family="Arial, sans-serif" font-size="12">
                ✨ Demo Vectorization Result (${imageSize}KB → SVG)
            </text>
            <text x="200" y="295" text-anchor="middle" fill="#6c757d" font-family="Arial, sans-serif" font-size="10">
                Generated at ${timestamp} • Fully scalable vector graphics
            </text>
        </svg>`;
    }
    
    showProcessing() {
        this.hideAllSections();
        this.processingSection.style.display = 'block';
    }
    
    showResults(svgContent) {
        this.hideAllSections();
        this.svgPreview.innerHTML = svgContent;
        this.resultsSection.style.display = 'block';
    }
    
    showError(message) {
        this.hideAllSections();
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
    }
    
    hideAllSections() {
        this.uploadSection.style.display = 'none';
        this.processingSection.style.display = 'none';
        this.resultsSection.style.display = 'none';
        this.errorSection.style.display = 'none';
    }
    
    resetToUpload() {
        this.hideAllSections();
        this.uploadSection.style.display = 'block';
        this.clearFile();
        this.currentSvg = null;
    }
    
    downloadSvg() {
        if (!this.currentSvg) {
            this.showError('No SVG available for download.');
            return;
        }
        
        // Create download link
        const blob = new Blob([this.currentSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `vectorized_${this.currentFile ? this.currentFile.name.split('.')[0] : 'image'}.svg`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
    }
    
    async loadCreditBalance() {
        try {
            console.log('💰 Loading credit balance...');
            const response = await fetch('/api/account');
            
            if (response.ok) {
                const accountData = await response.json();
                const creditAmount = document.getElementById('creditAmount');
                
                if (accountData.success && typeof accountData.credits === 'number') {
                    creditAmount.textContent = accountData.credits.toFixed(0);
                    console.log(`✅ Credit balance loaded: ${accountData.credits}`);
                } else {
                    creditAmount.textContent = 'Error';
                    console.log('❌ Failed to load credit balance:', accountData);
                }
            } else {
                const creditAmount = document.getElementById('creditAmount');
                creditAmount.textContent = 'Error';
                console.log('❌ Failed to fetch account info:', response.status);
            }
        } catch (error) {
            console.log('💥 Error loading credit balance:', error);
            const creditAmount = document.getElementById('creditAmount');
            creditAmount.textContent = 'Error';
        }
    }
    
    async refreshCreditBalance() {
        // Refresh credit balance after vectorization
        await this.loadCreditBalance();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageVectorizer();
});

// Add some utility functions for better user experience
window.addEventListener('beforeunload', (e) => {
    // Warn user if they're about to leave while processing
    const processingSection = document.getElementById('processingSection');
    if (processingSection && processingSection.style.display !== 'none') {
        e.preventDefault();
        e.returnValue = 'Vectorization is in progress. Are you sure you want to leave?';
    }
});

// Prevent default drag behaviors on the document
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
