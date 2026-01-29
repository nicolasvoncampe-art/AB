# FITLOG - Offline Fitness Tracker PWA

A mobile-first Progressive Web App designed for iPhone that works completely offline. Track your workouts and nutrition without needing an internet connection.

## Features

### Dashboard
- Real-time stats for today's activities
- Total km run
- Total pushups completed  
- Calories consumed
- Protein intake

### Workout Tracking
- Running (distance in km)
- Pushups (reps)
- Situps (reps)
- Squats (reps)
- Optional workout notes

### Food Tracking
- Food name
- Calories
- Protein (grams)
- Optional meal notes

### History
- Calendar-style daily summaries
- View all past entries
- Delete unwanted entries
- Organized by date with time stamps

## Installation on iPhone

### Method 1: Local Testing
1. Place all files in a directory
2. Serve with a local server (required for service workers):
   ```bash
   python3 -m http.server 8000
   ```
3. Open Safari on your iPhone and go to your computer's IP:8000
4. Tap the Share button
5. Tap "Add to Home Screen"
6. Tap "Add"

### Method 2: Deploy to Web
1. Upload files to any web hosting (GitHub Pages, Netlify, Vercel, etc.)
2. Open the URL in Safari on your iPhone
3. Tap the Share button
4. Tap "Add to Home Screen"
5. Tap "Add"

## Technical Details

- **Storage**: IndexedDB for local data persistence
- **Offline**: Service Worker caches all assets
- **Design**: iOS-optimized dark mode UI
- **Performance**: Vanilla JS, no frameworks
- **Size**: Minimal footprint (~20KB total)

## Files

- `index.html` - Main app structure
- `styles.css` - iOS-optimized styling
- `app.js` - Application logic and IndexedDB
- `service-worker.js` - Offline functionality
- `manifest.json` - PWA configuration
- `icon-192.png` - App icon (192x192)
- `icon-512.png` - App icon (512x512)

## Browser Requirements

- Safari 14+ (iOS 14+)
- Chrome 80+ (Android)
- Any modern browser with PWA support

## Privacy

All data is stored locally on your device. No data is sent to any server. No tracking, no analytics, no internet connection required after installation.

## License

Free to use and modify.
