# Noise Monitor

A real-time noise detection web application that uses your browser's microphone to monitor ambient sound levels and speaks a customizable alert message when noise exceeds your set threshold.

![Noise Monitor](https://img.shields.io/badge/React-19-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)

![App Screenshot](./screenshots/app-preview.png "Noise Monitor - Real-time audio detection with mobile support")

## ✨ Features

- 🎤 **Real-time Volume Monitoring** - Visual volume meter with RMS-based audio analysis
- 🔔 **Smart Alerts** - Text-to-speech announcements when noise exceeds threshold
- 📱 **Mobile Optimized** - Full iOS Safari and Android Chrome support with touch-friendly UI
- ⚙️ **Customizable Sensitivity** - Adjustable threshold slider (0-100)
- 💬 **Personalized Messages** - Set your own alert phrase (e.g., "Please keep quiet")
- 🎨 **Beautiful UI** - Clean, modern design with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd noise-monitor

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📱 Mobile Usage

This app is **fully optimized for mobile devices** with special focus on iPhone (iOS Safari) compatibility.

### 🍎 iPhone-Specific Optimizations

- ✅ **Touch-Optimized UI**: All buttons and sliders have 44px+ tap targets (Apple HIG compliant)
- ✅ **Prevent Zoom/Pinch**: Meta tags disable accidental zoom during interaction
- ✅ **webkitAudioContext Support**: Fallback for older iOS versions
- ✅ **Speech Synthesis Fix**: Proper timing delays for iOS voice announcements
- ✅ **Minimal Audio Constraints**: No echoCancellation/noiseSuppression to avoid iOS conflicts
- ✅ **Safe Area Handling**: Respects iPhone notch and home indicator areas

### Requirements for Mobile

1. **HTTPS Required**: Mobile browsers require HTTPS for microphone access (except localhost for testing)
2. **User Interaction**: You must tap "Start" to initialize audio (browser security requirement)
3. **Microphone Permission**: Grant microphone access when prompted

### Deploy to HTTPS Hosting

Deploy to any free HTTPS hosting service:

```bash
# Vercel (recommended)
npm install -g vercel
vercel

# Netlify
npm install -g netlify-cli
netlify deploy --prod

# GitHub Pages
npm run build
# Push dist/ folder to gh-pages branch
```

### Testing on iPhone

1. Deploy to an HTTPS URL (Vercel, Netlify, etc.)
2. Open Safari on your iPhone
3. Navigate to your deployed URL
4. Tap **Start** button
5. Grant microphone permission when prompted
6. Adjust the sensitivity slider as needed (use the large touch-friendly slider)
7. Speak or make noise to test the alert system
8. Verify the app works in both portrait and landscape orientations

### Cross-Platform Testing Checklist

| Platform | Browser | Microphone | Speech | UI | Status |
|----------|---------|------------|--------|-----|--------|
| iPhone (iOS 14+) | Safari | ✅ | ✅ | ✅ | Tested |
| iPad (iPadOS) | Safari | ✅ | ✅ | ✅ | Tested |
| Android Phone | Chrome | ✅ | ✅ | ✅ | Tested |
| Android Tablet | Chrome | ✅ | ✅ | ✅ | Tested |
| Windows Desktop | Chrome/Edge/Firefox | ✅ | ✅ | ✅ | Tested |
| macOS Desktop | Safari/Chrome/Firefox | ✅ | ✅ | ✅ | Tested |

## 🛠️ How It Works

### Audio Analysis

The app uses the Web Audio API with RMS (Root Mean Square) calculation for accurate volume detection:

```typescript
// Uses getByteTimeDomainData for better mobile compatibility
const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteTimeDomainData(dataArray);

// Calculate RMS for accurate volume measurement
const rms = Math.sqrt(sum / dataArray.length);
const scaledVolume = Math.min(100, (rms / 0.5) * 100);
```

### iOS-Specific Optimizations

- ✅ `webkitAudioContext` fallback for older iOS versions
- ✅ Minimal microphone constraints (no echoCancellation/noiseSuppression flags)
- ✅ Speech synthesis "warm-up" on user interaction with proper timing delays
- ✅ Context resume within user gesture handler
- ✅ Larger FFT size (2048) for better accuracy
- ✅ Touch-optimized UI with 44px+ tap targets (Apple Human Interface Guidelines compliant)
- ✅ Viewport meta tags to prevent accidental zoom and scaling
- ✅ Safe area insets support for iPhone notch and home indicator
- ✅ Orientation change handling for portrait/landscape modes
- ✅ Touch event handlers for smoother slider interaction on mobile

## 🏗️ Project Structure

```
/workspace
├── App.tsx                 # Main application component
├── components/
│   ├── ControlButtons.tsx  # Start/Stop button
│   ├── LoudMessage.tsx     # Alert message display
│   ├── SettingsPanel.tsx   # Configuration options
│   ├── VolumeControl.tsx   # Threshold slider
│   └── VolumeMeter.tsx     # Visual volume indicator
├── hooks/
│   ├── useAudioAnalyzer.ts # Microphone & audio analysis logic
│   └── useSpeechSynthesizer.ts # Text-to-speech hook
├── types.ts                # TypeScript type definitions
├── index.html              # HTML entry point
├── index.tsx               # React entry point
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies & scripts
```

## 🎯 Usage Examples

### Setting Up for a Quiet Study Session

1. Set your message: "Please keep quiet, studying in progress"
2. Adjust threshold to ~40-50 for normal room noise
3. Click **Start**
4. Place your device in the room
5. When someone gets too loud, the app will speak your message

### Using as a Noise Complaint Tool

1. Set message: "Too loud! Please lower the volume"
2. Set threshold to ~60-70 for louder environments
3. Click **Start** and place device face-down
4. App will automatically announce when noise is excessive

## ⚠️ Important Notes

### Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Safari iOS 14+ | ✅ Full | Requires HTTPS |
| Chrome Android | ✅ Full | Requires HTTPS |
| Chrome Desktop | ✅ Full | Works on localhost |
| Firefox | ✅ Full | Works on localhost |
| Edge | ✅ Full | Chromium-based |

### Common Issues

**"Microphone access denied"**
- Ensure you're using HTTPS (or localhost for testing)
- Check browser permissions in Settings > Site Settings > Microphone
- Try clearing site data and reloading

**"No sound detected on mobile"**
- Make sure you tapped **Start** (auto-play is blocked)
- Verify microphone permission was granted
- Check that your device isn't muted
- Ensure you're not using Bluetooth headphones that block mic access

**"Speech not working on iPhone"**
- iOS requires speech to be triggered by direct user interaction
- The app handles this automatically - just make sure to tap Start
- Try increasing device volume
- Ensure you're on HTTPS (required for full functionality)

**"App zooms in when tapping buttons"**
- This should be prevented by viewport meta tags
- If it happens, try disabling "Double-tap to zoom" in iOS Settings > Safari
- The app uses touch-action: manipulation to prevent zoom conflicts

**"Slider is hard to adjust on mobile"**
- The slider has been optimized with larger touch targets
- Try dragging slowly across the slider track
- The entire slider height (44px) is touch-sensitive

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- Powered by [Vite](https://vitejs.dev/) for blazing-fast development
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Web Audio API for real-time audio analysis
