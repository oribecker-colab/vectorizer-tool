#!/bin/bash

# Image Vectorizer Tool - Startup Script
echo "🚀 Starting Image Vectorizer Tool..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm (usually comes with Node.js)"
    exit 1
fi

echo "✅ Node.js and npm are available"

# Navigate to the project directory
cd "$(dirname "$0")"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Start the server
echo "🌐 Starting server on http://localhost:3001..."
echo "📝 Press Ctrl+C to stop the server"
echo "🔧 Server logs will appear below:"
echo "----------------------------------------"

npm start
