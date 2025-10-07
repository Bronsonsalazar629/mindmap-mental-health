# React Native Mobile Setup Guide

## Project Structure Organization

```
mindmap-app/
├── backend/              # Keep existing backend (reuse APIs)
├── frontend/             # Keep existing web frontend
├── mobile-app/           # New React Native app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── screens/      # App screens
│   │   ├── navigation/   # React Navigation setup
│   │   ├── services/     # API calls to backend
│   │   ├── store/        # State management (Redux/Context)
│   │   ├── utils/        # Helper functions
│   │   └── assets/       # Images, fonts, etc.
│   ├── android/          # Android native code
│   ├── ios/              # iOS native code
│   └── app.json          # Expo configuration
└── shared/               # Shared utilities between web/mobile
```

## Required Software Installation

### 1. Install Node.js (if not already installed)
- Download from https://nodejs.org (LTS version)
- Verify: `node --version` and `npm --version`

### 2. Install React Native CLI and Expo CLI
```bash
npm install -g @react-native-community/cli
npm install -g @expo/cli
```

### 3. Install Android Studio (for emulator)
- Download from https://developer.android.com/studio
- During installation, ensure "Android Virtual Device" is selected
- After installation, open Android Studio and install SDK tools

## VS Code Extensions to Install

### Essential Extensions:
1. **React Native Tools** (Microsoft)
2. **Expo Tools** (Expo)
3. **ES7+ React/Redux/React-Native snippets**
4. **Prettier - Code formatter**
5. **Auto Rename Tag**
6. **Bracket Pair Colorizer**
7. **GitLens**

### Install via VS Code:
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search and install each extension above

## Android Emulator Setup (No QR Code Method)

### 1. Open Android Studio
- Launch Android Studio
- Click "More Actions" → "Virtual Device Manager"

### 2. Create Virtual Device
- Click "Create device"
- Select "Phone" → Choose "Pixel 4" or similar
- Select system image (API 30 or higher recommended)
- Click "Next" → "Finish"

### 3. Start Emulator
- Click the play button next to your virtual device
- Wait for Android to boot up completely

## VS Code Mobile Development Workflow

### 1. Create React Native Project
```bash
cd mindmap-app/mobile-app
npx create-expo-app . --template blank
```

### 2. VS Code Configuration
Create `.vscode/settings.json`:
```json
{
  "typescript.suggest.autoImports": true,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "emmet.triggerExpansionOnTab": true
}
```

### 3. Start Development
```bash
# In mobile-app directory
npx expo start

# Choose 'a' for Android emulator (no QR code needed)
# Choose 'w' for web preview
```

## Development Commands

```bash
# Start metro bundler
npx expo start

# Start with Android emulator
npx expo start --android

# Start with web
npx expo start --web

# Clear cache if needed
npx expo start --clear
```

## Next Steps After Setup

1. Install navigation: `npx expo install @react-navigation/native`
2. Install UI library: `npm install react-native-elements`
3. Install maps: `npx expo install react-native-maps`
4. Install state management: `npm install @reduxjs/toolkit react-redux`

## Troubleshooting

### If emulator doesn't start:
1. Check Android Studio SDK tools are installed
2. Verify ANDROID_HOME environment variable
3. Try: `adb devices` to see connected devices

### If Expo doesn't detect emulator:
1. Make sure emulator is fully booted
2. Run: `adb devices` (should show emulator)
3. Try: `npx expo start --android`