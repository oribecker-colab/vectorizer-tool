class ImageVectorizer {
    constructor() {
        // ⚠️ WARNING: API credentials are exposed in client-side code
        // This is only suitable for demos or when you don't mind credential exposure
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
            // Call vectorization API directly
            const svgResult = await this.callVectorizerAI(this.currentFile);
            
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
    
    async callVectorizerAI(file) {
        console.log('🚀 Starting direct vectorization via vectorizer.ai API...');
        
        try {
            // Create FormData for the API call
            const formData = new FormData();
            formData.append('image', file);
            formData.append('mode', 'production'); // Use production mode for clean results
            formData.append('output.file_format', 'svg');
            formData.append('policy.retention_days', '1');
            
            console.log('📡 Making direct API call to vectorizer.ai...');
            console.log('🔐 Using API credentials:', this.apiCredentials.apiId);
            
            const response = await fetch('https://vectorizer.ai/api/v1/vectorize', {
                method: 'POST',
                headers: {
                    'Authorization': this.apiCredentials.authorization
                },
                body: formData
            });
            
            console.log('📊 API Response status:', response.status);
            
            if (response.ok) {
                const svgContent = await response.text();
                const creditsCharged = response.headers.get('X-Credits-Charged') || '0';
                
                console.log('✅ SVG received, length:', svgContent.length);
                console.log('💰 Credits charged:', creditsCharged);
                
                return svgContent;
            } else {
                // Handle error response
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: await response.text() };
                }
                
                console.log('❌ API Error:', errorData);
                
                // If CORS error or other API issue, show helpful message
                if (response.status === 0 || !response.status) {
                    throw new Error('CORS error: Cannot call vectorizer.ai directly from browser. Consider using a server-side version.');
                } else {
                    throw new Error(errorData.error?.message || errorData.message || `API Error ${response.status}`);
                }
            }
            
        } catch (error) {
            console.error('💥 API call error:', error);
            
            // If it's a CORS error, provide a demo SVG
            if (error.message.includes('CORS') || error.message.includes('fetch')) {
                console.log('🔄 CORS issue detected, showing demo SVG...');
                return this.createDemoSVG(file.size, 'CORS Error: Direct API calls blocked by browser. Use server-side version for real vectorization.');
            } else {
                throw error;
            }
        }
    }
    
    createDemoSVG(fileSize, errorMessage = null) {
        const timestamp = new Date().toLocaleTimeString();
        const imageSizeKB = Math.round(fileSize / 1024);
        
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
            <text x="200" y="260" text-anchor="middle" fill="#495057" font-family="Arial, sans-serif" font-size="12">
                ✨ Demo Vectorization Result (${imageSizeKB}KB → SVG)
            </text>
            <text x="200" y="275" text-anchor="middle" fill="#6c757d" font-family="Arial, sans-serif" font-size="10">
                Generated at ${timestamp} • GitHub Pages Demo Version
            </text>
            ${errorMessage ? `<text x="200" y="290" text-anchor="middle" fill="#dc3545" font-family="Arial, sans-serif" font-size="9">
                Note: ${errorMessage.substring(0, 60)}${errorMessage.length > 60 ? '...' : ''}
            </text>` : ''}
        </svg>`;
    }
    
    async loadCreditBalance() {
        try {
            console.log('💰 Loading credit balance...');
            
            const response = await fetch('https://vectorizer.ai/api/v1/account', {
                method: 'GET',
                headers: {
                    'Authorization': this.apiCredentials.authorization
                }
            });
            
            if (response.ok) {
                const accountData = await response.json();
                const creditAmount = document.getElementById('creditAmount');
                
                if (typeof accountData.credits === 'number') {
                    creditAmount.textContent = accountData.credits.toFixed(0);
                    console.log(`✅ Credit balance loaded: ${accountData.credits}`);
                } else {
                    creditAmount.textContent = 'Error';
                    console.log('❌ Failed to load credit balance:', accountData);
                }
            } else {
                const creditAmount = document.getElementById('creditAmount');
                creditAmount.textContent = 'CORS';
                console.log('❌ CORS error loading credits - this is expected on GitHub Pages');
            }
        } catch (error) {
            console.log('💥 Error loading credit balance (CORS expected):', error.message);
            const creditAmount = document.getElementById('creditAmount');
            creditAmount.textContent = 'CORS';
        }
    }
    
    async refreshCreditBalance() {
        // Refresh credit balance after vectorization
        await this.loadCreditBalance();
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
