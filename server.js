const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3001;

// API Credentials for vectorizer.ai
const API_CREDENTIALS = {
    apiId: 'vkn4n2fhddhthke',
    apiSecret: 'm7m9jai9f852lb1lopsa3mmod53d9hccdtajg8rt7fmsmjs729vc',
    authorization: 'Basic dmtuNG4yZmhkZGh0aGtlOm03bTlqYWk5Zjg1MmxiMWxvcHNhM21tb2Q1M2Q5aGNjZHRhamc4cnQ3Zm1zbWpzNzI5dmM='
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        credentials: {
            hasApiId: !!API_CREDENTIALS.apiId,
            hasApiSecret: !!API_CREDENTIALS.apiSecret,
            hasAuth: !!API_CREDENTIALS.authorization
        }
    });
});

// Account info endpoint for credit balance
app.get('/api/account', async (req, res) => {
    try {
        const response = await fetch('https://vectorizer.ai/api/v1/account', {
            method: 'GET',
            headers: {
                'Authorization': API_CREDENTIALS.authorization
            }
        });
        
        if (response.ok) {
            const accountData = await response.json();
            res.json({
                success: true,
                credits: accountData.credits,
                subscriptionPlan: accountData.subscriptionPlan,
                subscriptionState: accountData.subscriptionState,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(response.status).json({
                success: false,
                error: 'Failed to fetch account info',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error fetching account info:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Main vectorization endpoint
app.post('/api/vectorize', upload.single('image'), async (req, res) => {
    console.log('🚀 Vectorization request received');
    
    try {
        if (!req.file && !req.body.imageData) {
            return res.status(400).json({ 
                error: 'No image provided. Send either a file or base64 imageData.' 
            });
        }

        let imageBuffer;
        let originalName = 'uploaded_image';

        if (req.file) {
            imageBuffer = req.file.buffer;
            originalName = req.file.originalname;
            console.log(`📁 File upload: ${originalName} (${req.file.size} bytes)`);
        } else if (req.body.imageData) {
            // Handle base64 data
            const base64Data = req.body.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
            imageBuffer = Buffer.from(base64Data, 'base64');
            console.log(`📁 Base64 upload: ${imageBuffer.length} bytes`);
        }

        console.log(`📊 Processing image: ${imageBuffer.length} bytes`);

        // Preprocess image for vectorizer.ai compatibility
        console.log('🔧 Preprocessing image for vectorizer.ai...');
        const processedImage = await preprocessImage(imageBuffer);
        
        // Call vectorizer.ai API
        console.log('🔍 Calling vectorizer.ai API...');
        const svgResult = await callVectorizerAI(processedImage.buffer, processedImage.filename);
        
        if (svgResult.success) {
            console.log('✅ Vectorization successful');
            return res.json({
                success: true,
                svg: svgResult.svg,
                service: 'Vectorizer.AI',
                originalSize: imageBuffer.length,
                timestamp: new Date().toISOString(),
                creditsCharged: svgResult.creditsCharged,
                imageToken: svgResult.imageToken
            });
        } else {
            console.log('❌ Vectorization failed, creating demo SVG:', svgResult.error);
            
            // Create a demo SVG with API error information
            const demoSvg = createDemoSVG(imageBuffer.length, svgResult.message);
            
            return res.json({
                success: true,
                svg: demoSvg,
                service: 'Demo Mode (API Issue)',
                originalSize: imageBuffer.length,
                timestamp: new Date().toISOString(),
                creditsCharged: 0,
                note: `API Error: ${svgResult.message}. Showing demo result instead.`
            });
        }

    } catch (error) {
        console.error('� Server error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Vectorizer.AI API function
async function callVectorizerAI(imageBuffer, filename) {
    try {
        console.log('📡 Making request to vectorizer.ai API...');
        
        // Create form data for multipart upload
        const formData = new FormData();
        formData.append('image', imageBuffer, {
            filename: filename,
            contentType: 'image/png' // Try PNG format
        });
        
        // Use production mode for clean results (costs 1 credit)
        formData.append('mode', 'production');
        formData.append('output.file_format', 'svg');
        formData.append('policy.retention_days', '1');
        
        console.log('🔐 Using API credentials:', API_CREDENTIALS.apiId);
        
        const response = await fetch('https://vectorizer.ai/api/v1/vectorize', {
            method: 'POST',
            headers: {
                'Authorization': API_CREDENTIALS.authorization,
                ...formData.getHeaders()
            },
            body: formData,
            timeout: 180000 // 3 minute timeout as recommended
        });
        
        console.log('📊 API Response status:', response.status);
        console.log('📊 API Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            // vectorizer.ai returns SVG directly, not JSON
            const svgContent = await response.text();
            const creditsCharged = response.headers.get('X-Credits-Charged') || '0';
            const imageToken = response.headers.get('X-Image-Token');
            
            console.log('✅ SVG received, length:', svgContent.length);
            console.log('💰 Credits charged:', creditsCharged);
            
            return {
                success: true,
                svg: svgContent,
                creditsCharged: parseFloat(creditsCharged),
                imageToken: imageToken
            };
        } else {
            // Handle error response
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }
            
            console.log('❌ API Error:', errorData);
            
            return {
                success: false,
                error: `API Error ${response.status}`,
                message: errorData.error?.message || errorData.message || 'Unknown API error',
                status: response.status
            };
        }
        
    } catch (error) {
        console.error('💥 Network/API error:', error);
        
        return {
            success: false,
            error: 'Network Error',
            message: error.message || 'Failed to connect to vectorizer.ai API'
        };
    }
}

// Test API credentials function
async function testAPICredentials() {
    try {
        console.log('🧪 Testing API credentials...');
        
        const response = await fetch('https://vectorizer.ai/api/v1/account', {
            method: 'GET',
            headers: {
                'Authorization': API_CREDENTIALS.authorization
            }
        });
        
        if (response.ok) {
            const accountData = await response.json();
            console.log('✅ API credentials valid');
            console.log('📊 Account info:', accountData);
            return true;
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.log('❌ API credentials invalid:', errorData);
            return false;
        }
    } catch (error) {
        console.log('💥 Failed to test credentials:', error.message);
        return false;
    }
}

// Image preprocessing function for vectorizer.ai compatibility
async function preprocessImage(imageBuffer) {
    try {
        console.log('🔧 Starting image preprocessing...');
        
        // Get image metadata
        const metadata = await sharp(imageBuffer).metadata();
        console.log(`📊 Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
        
        // Calculate optimal size (vectorizer.ai works better with smaller, cleaner images)
        const maxDimension = 800; // Reasonable size for vectorization
        let width = metadata.width;
        let height = metadata.height;
        
        if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
            console.log(`📏 Resizing to: ${width}x${height}`);
        }
        
        // Process the image for optimal vectorization - match the working format
        const processedBuffer = await sharp(imageBuffer)
            .resize(width, height, {
                kernel: sharp.kernel.lanczos3,
                withoutEnlargement: true
            })
            .removeAlpha() // Remove transparency that might cause issues
            .png({
                quality: 100,
                compressionLevel: 9,
                palette: false, // Don't use palette mode
                colors: 256 // Limit colors
            })
            .toBuffer();
        
        console.log(`✅ Image preprocessed: ${imageBuffer.length} → ${processedBuffer.length} bytes`);
        
        return {
            buffer: processedBuffer,
            filename: 'processed_image.png',
            originalSize: imageBuffer.length,
            processedSize: processedBuffer.length
        };
        
    } catch (error) {
        console.error('💥 Image preprocessing error:', error);
        // If preprocessing fails, return original image
        return {
            buffer: imageBuffer,
            filename: 'original_image.png',
            originalSize: imageBuffer.length,
            processedSize: imageBuffer.length
        };
    }
}

// Create demo SVG function
function createDemoSVG(imageSize, errorMessage) {
    const timestamp = new Date().toLocaleTimeString();
    const imageSizeKB = Math.round(imageSize / 1024);
    
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
            Generated at ${timestamp} • Fully scalable vector graphics
        </text>
        <text x="200" y="290" text-anchor="middle" fill="#dc3545" font-family="Arial, sans-serif" font-size="9">
            Note: ${errorMessage || 'API integration in progress'}
        </text>
    </svg>`;
}

// Test credentials on startup
testAPICredentials();

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('💥 Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Vectorizer server running on http://localhost:${PORT}`);
    console.log(`📊 API Credentials loaded: ${API_CREDENTIALS.apiId}`);
    console.log(`🔧 Ready to process vectorization requests`);
});

module.exports = app;
