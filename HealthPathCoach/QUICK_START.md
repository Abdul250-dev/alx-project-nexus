# Quick Start Guide - HealthPathCoach

Get HealthPathCoach running in under 10 minutes! 🚀

## ⚡ Quick Setup (5 minutes)

### 1. Prerequisites Check
Make sure you have:
- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

### 2. Clone & Install
```bash
# Clone the repository
git clone https://github.com/Abdul250-dev/alx-project-nexus.git

# Navigate to project
cd alx-project-nexus/HealthPathCoach

# Install dependencies
npm install

# Install Expo CLI
npm install -g @expo/cli
```

### 3. Start Development Server
```bash
# Start the app
npx expo start
```

### 4. Run on Your Device
- **Mobile**: Install [Expo Go](https://expo.dev/client) and scan the QR code
- **Web**: Press `w` in terminal to open in browser
- **Android**: Press `a` (requires Android Studio/emulator)
- **iOS**: Press `i` (macOS only, requires Xcode)

## 🎯 That's It!

Your app should now be running! The development server will automatically reload when you make changes.

## 🔧 Need More Details?

For comprehensive setup instructions, troubleshooting, and advanced configuration, see the [Complete Setup Guide](./SETUP_GUIDE.md).

## 📱 Testing Options

| Platform | Method | Requirements |
|----------|--------|--------------|
| **Mobile** | Expo Go App | Phone with Expo Go installed |
| **Web** | Browser | Modern web browser |
| **Android** | Emulator | Android Studio |
| **iOS** | Simulator | macOS + Xcode |

## 🆘 Quick Troubleshooting

**App won't start?**
```bash
npx expo start --clear
```

**Dependencies issues?**
```bash
rm -rf node_modules && npm install
```

**Need help?** Check the [Complete Setup Guide](./SETUP_GUIDE.md) for detailed troubleshooting.
