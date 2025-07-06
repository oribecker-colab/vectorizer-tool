const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

// API Credentials
const API_CREDENTIALS = {
    apiId: 'vkn4n2fhddhthke',
    apiSecret: 'm7m9jai9f852lb1lopsa3mmod53d9hccdtajg8rt7fmsmjs729vc',
    authorization: 'Basic dmtuNG4yZmhkZGh0aGtlOm03bTlqYWk5Zjg1MmxiMWxvcHNhM21tb2Q1M2Q5aGNjZHRhamc4cnQ3Zm1zbWpzNzI5dmM='
};

async function testVectorizerAPI() {
    console.log('🧪 Testing Vectorizer.AI API Integration...\n');
    
    // Test 1: Check account status
    console.log('1️⃣ Testing account status...');
    try {
        const accountResponse = await fetch('https://vectorizer.ai/api/v1/account', {
            method: 'GET',
            headers: {
                'Authorization': API_CREDENTIALS.authorization
            }
        });
        
        if (accountResponse.ok) {
            const accountData = await accountResponse.json();
            console.log('✅ Account Status:', accountData);
            console.log(`💰 Available Credits: ${accountData.credits}`);
        } else {
            console.log('❌ Account check failed:', accountResponse.status);
        }
    } catch (error) {
        console.log('💥 Account check error:', error.message);
    }
    
    console.log('\n2️⃣ Testing vectorization with production mode (1 credit)...');
    
    // Use the proper test image we created
    const testImageBuffer = fs.readFileSync('test-image.png');
    console.log(`📷 Using test image: ${testImageBuffer.length} bytes`);
    
    try {
        const formData = new FormData();
        formData.append('image', testImageBuffer, {
            filename: 'test.png',
            contentType: 'image/png'
        });
        
        // Use production mode (costs 1 credit but should work better)
        formData.append('mode', 'production');
        formData.append('output.file_format', 'svg');
        formData.append('policy.retention_days', '1');
        
        console.log('📤 Sending test image to vectorizer.ai...');
        
        const response = await fetch('https://vectorizer.ai/api/v1/vectorize', {
            method: 'POST',
            headers: {
                'Authorization': API_CREDENTIALS.authorization,
                ...formData.getHeaders()
            },
            body: formData,
            timeout: 60000
        });
        
        console.log('📊 Response Status:', response.status);
        console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const svgContent = await response.text();
            const creditsCharged = response.headers.get('X-Credits-Charged') || '0';
            
            console.log('✅ Vectorization successful!');
            console.log('💰 Credits charged:', creditsCharged);
            console.log('📄 SVG length:', svgContent.length, 'characters');
            console.log('🎯 SVG preview (first 200 chars):', svgContent.substring(0, 200) + '...');
            
            // Save the result
            fs.writeFileSync('test-result.svg', svgContent);
            console.log('💾 Result saved to test-result.svg');
            
        } else {
            const errorText = await response.text();
            console.log('❌ Vectorization failed');
            console.log('📄 Error response:', errorText);
        }
        
    } catch (error) {
        console.log('💥 Vectorization error:', error.message);
    }
    
    console.log('\n🎉 API test completed!');
}

// Run the test
testVectorizerAPI().catch(console.error);
