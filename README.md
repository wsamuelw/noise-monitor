# Noise Monitor

A web application that uses your browser's microphone to detect ambient noise levels in real-time and speaks a customizable message when noise exceeds a threshold.

## Mobile/iOS Support

This app is optimized for mobile devices including iPhone (iOS Safari) and Android Chrome. The following improvements ensure reliable microphone detection on mobile:

### Key Mobile Fixes Applied:

1. **Minimal Microphone Constraints**: iOS Safari is strict about audio constraints. We use only `channelCount: 1` and `sampleRate: 44100` without echo cancellation or noise suppression flags that can cause silent streams.

2. **RMS-based Volume Detection**: Uses `getByteTimeDomainData()` with Root Mean Square calculation instead of frequency data, which is more reliable on mobile browsers.

3. **AudioContext Resume**: iOS requires AudioContext to be resumed within a user gesture event. The app properly handles the suspended state.

4. **webkitAudioContext Fallback**: Supports older iOS Safari versions that use the prefixed `webkitAudioContext`.

5. **Speech Synthesis Warm-up**: iOS requires speech synthesis to be initialized during a user interaction. The app "warms up" the speech engine with an empty utterance.

6. **Mobile-optimized UI**: 
   - Larger touch targets (44px+ for sliders, 48px+ for buttons)
   - Proper viewport settings to prevent zoom issues
   - Touch-action optimizations to prevent scroll interference

### Requirements for Mobile:

1. **HTTPS Required**: Modern browsers require HTTPS for microphone access. When testing locally, use `localhost` which is exempt, but for deployment you must use HTTPS.

2. **User Interaction**: The user must tap the "Start" button to initiate microphone access (browser security requirement).

3. **Microphone Permission**: Users must grant microphone permission when prompted.

### Testing on iPhone:

1. Deploy the app to an HTTPS server (or use a service like Vercel, Netlify, or GitHub Pages)
2. Open Safari on your iPhone
3. Navigate to the app URL
4. Tap "Start" button
5. Grant microphone permission when prompted
6. Speak or make noise - you should see the volume meter respond
7. Adjust the threshold slider to set sensitivity
8. When volume exceeds threshold, you'll hear "Please keep quiet" (or your custom message)

### Troubleshooting:

- **No volume detected**: Ensure you're using HTTPS, granted microphone permission, and try increasing the sensitivity (lower the threshold)
- **Speech not working**: iOS may require multiple interactions; try tapping Start again
- **App not loading**: Check browser console for errors; ensure you're using a modern browser version

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Deploy to any static hosting service that supports HTTPS (Vercel, Netlify, GitHub Pages, etc.).
