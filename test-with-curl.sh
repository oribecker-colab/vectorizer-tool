#!/bin/bash

echo "🧪 Testing vectorizer.ai API with curl..."
echo "📊 Account: vkn4n2fhddhthke"
echo ""

# Test account status first
echo "1️⃣ Testing account status..."
curl -s -u "vkn4n2fhddhthke:m7m9jai9f852lb1lopsa3mmod53d9hccdtajg8rt7fmsmjs729vc" \
  "https://vectorizer.ai/api/v1/account" | jq '.'

echo ""
echo "2️⃣ Testing vectorization with a simple image..."

# Create a simple test image using ImageMagick (if available) or use our existing one
if command -v convert &> /dev/null; then
    echo "📷 Creating test image with ImageMagick..."
    convert -size 100x100 xc:red test-red-square.png
    TEST_IMAGE="test-red-square.png"
else
    echo "📷 Using existing test image..."
    TEST_IMAGE="test-image.png"
fi

echo "📤 Uploading $TEST_IMAGE to vectorizer.ai..."

# Test with curl
curl -s -u "vkn4n2fhddhthke:m7m9jai9f852lb1lopsa3mmod53d9hccdtajg8rt7fmsmjs729vc" \
  -F "image=@$TEST_IMAGE" \
  -F "mode=test" \
  -F "output.file_format=svg" \
  "https://vectorizer.ai/api/v1/vectorize" \
  -o curl-result.svg \
  -w "HTTP Status: %{http_code}\nTime: %{time_total}s\n"

echo ""
if [ -f "curl-result.svg" ] && [ -s "curl-result.svg" ]; then
    echo "✅ SVG result saved to curl-result.svg"
    echo "📄 File size: $(wc -c < curl-result.svg) bytes"
    echo "🎯 First 200 characters:"
    head -c 200 curl-result.svg
    echo ""
else
    echo "❌ No SVG result or empty file"
    if [ -f "curl-result.svg" ]; then
        echo "📄 Error response:"
        cat curl-result.svg
    fi
fi

echo ""
echo "🎉 Test completed!"
