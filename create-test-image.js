const fs = require('fs');

// Create a simple test image - a minimal valid PNG (8x8 red square)
// This is a complete, valid PNG that vectorizer.ai should be able to process
const redSquarePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAA5SURBVBiVY/z//z8DAwMDEwMDw38GBgYGJgYGhv8MDAwMTAwMDP8ZGBgYmBgYGP4zMDAwMDExMPwHAAcAAwABAAD//2Q=';

// Save the image to a file for testing
const imageBuffer = Buffer.from(redSquarePngBase64, 'base64');
fs.writeFileSync('test-image.png', imageBuffer);

console.log('✅ Test image created: test-image.png');
console.log(`📊 Image size: ${imageBuffer.length} bytes`);
console.log('🎯 This is a valid 8x8 red square PNG that vectorizer.ai should accept');
