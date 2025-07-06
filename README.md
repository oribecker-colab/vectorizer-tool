# Image Vectorizer Tool

A web-based tool for converting raster images to vector format (SVG) using vectorizer.ai API.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
```bash
npm install
```

### Run Locally
```bash
npm start
```

Then open: http://localhost:3001

## 🔧 Features

- **Real Vectorization**: Uses vectorizer.ai API for professional results
- **Multiple Formats**: Supports JPG, PNG, GIF, BMP, HEIF
- **Image Preprocessing**: Automatic optimization with Sharp library
- **Credit Counter**: Real-time balance display
- **Drag & Drop**: Professional upload interface
- **Download**: Get clean SVG files

## 📊 Usage

1. **Upload** an image (drag & drop or click to browse)
2. **Click** "Vectorize Image" 
3. **Wait** for processing (uses 1 credit in production mode)
4. **Download** your SVG result

## ⚙️ Configuration

API credentials are configured in `server.js`. The tool uses production mode for clean, watermark-free results.

## 🛠 Development

```bash
npm run dev  # Run with nodemon for auto-restart
```

## 📁 Project Structure

```
vectorizer-tool/
├── index.html          # Main web interface
├── styles.css          # Styling
├── script.js           # Frontend JavaScript
├── server.js           # Node.js backend
├── package.json        # Dependencies
└── README.md           # This file
```

## 💰 Credits

The tool uses vectorizer.ai production mode which costs 1 credit per image. Monitor your usage in the credit counter.

## 🔒 Security

API credentials are stored server-side for security. Never expose them in client-side code.
