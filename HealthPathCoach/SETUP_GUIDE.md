# HealthPathCoach - Complete Setup Guide

This guide will walk you through the complete process of setting up and running the HealthPathCoach mobile application on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)
- **Expo CLI** - We'll install this during setup

### Platform-Specific Requirements

#### For Android Development:
- **Android Studio** - [Download here](https://developer.android.com/studio)
- **Java Development Kit (JDK) 17** - [Download here](https://adoptium.net/)
- **Android SDK** (installed via Android Studio)

#### For iOS Development (macOS only):
- **Xcode** (latest version) - Available on Mac App Store
- **iOS Simulator** (comes with Xcode)
- **CocoaPods** - We'll install this during setup

#### For Web Development:
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🚀 Step-by-Step Installation

### Step 1: Clone the Repository

1. **Open your terminal/command prompt**
2. **Navigate to your desired directory**:
   ```bash
   cd /path/to/your/projects
   ```

3. **Clone the repository**:
   ```bash
   git clone https://github.com/Abdul250-dev/alx-project-nexus.git
   ```

4. **Navigate to the project directory**:
   ```bash
   cd alx-project-nexus/HealthPathCoach
   ```

### Step 2: Install Dependencies

1. **Install project dependencies**:
   ```bash
   npm install
   ```
   
   Or if you prefer yarn:
   ```bash
   yarn install
   ```

2. **Install Expo CLI globally** (if not already installed):
   ```bash
   npm install -g @expo/cli
   ```

3. **Install EAS CLI** (for building and deployment):
   ```bash
   npm install -g eas-cli
   ```

### Step 3: Environment Setup

1. **Create environment configuration**:
   The app uses Firebase for backend services. You'll need to set up your own Firebase project or use the provided configuration.

2. **Firebase Setup** (if using your own Firebase project):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase configuration
   - Update the Firebase configuration in `app.json` under the `extra` section

3. **Verify configuration**:
   ```bash
   npx expo config --json
   ```

### Step 4: Platform-Specific Setup

#### Android Setup

1. **Install Android Studio**:
   - Download and install Android Studio
   - Open Android Studio and follow the setup wizard
   - Install Android SDK (API level 33 or higher)

2. **Set up Android environment variables**:
   
   **For Windows**:
   ```cmd
   set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   set PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
   ```
   
   **For macOS/Linux**:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

3. **Create Android Virtual Device (AVD)**:
   - Open Android Studio
   - Go to Tools → AVD Manager
   - Create a new virtual device
   - Choose a device definition and system image
   - Start the emulator

#### iOS Setup (macOS only)

1. **Install Xcode**:
   - Open Mac App Store
   - Search for "Xcode" and install
   - Launch Xcode and accept license agreements

2. **Install iOS Simulator**:
   - Open Xcode
   - Go to Xcode → Preferences → Components
   - Download iOS Simulator for your desired iOS version

3. **Install CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```

## 🏃‍♂️ Running the Application

### Method 1: Development Server (Recommended)

1. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

2. **Choose your platform**:
   - **For Android**: Press `a` or scan QR code with Expo Go app
   - **For iOS**: Press `i` or scan QR code with Camera app
   - **For Web**: Press `w` to open in browser

3. **Install Expo Go app** (for mobile testing):
   - **Android**: [Download from Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iOS**: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)

### Method 2: Platform-Specific Development

#### Running on Android Emulator

1. **Start Android emulator**:
   ```bash
   npx expo run:android
   ```

2. **Or use Expo CLI**:
   ```bash
   npx expo start --android
   ```

#### Running on iOS Simulator (macOS only)

1. **Start iOS simulator**:
   ```bash
   npx expo run:ios
   ```

2. **Or use Expo CLI**:
   ```bash
   npx expo start --ios
   ```

#### Running on Web

1. **Start web development server**:
   ```bash
   npx expo start --web
   ```

2. **Or use Next.js directly**:
   ```bash
   npm run web
   ```

## 🔧 Troubleshooting Common Issues

### Issue 1: Metro bundler cache problems
**Solution**:
```bash
npx expo start --clear
```

### Issue 2: Node modules issues
**Solution**:
```bash
rm -rf node_modules
npm install
```

### Issue 3: Android emulator not detected
**Solution**:
```bash
# Check if emulator is running
adb devices

# Start emulator manually
emulator -avd <your_avd_name>
```

### Issue 4: iOS simulator issues (macOS)
**Solution**:
```bash
# Reset iOS simulator
xcrun simctl erase all

# Reinstall pods
cd ios && pod install && cd ..
```

### Issue 5: Firebase configuration errors
**Solution**:
1. Verify Firebase project settings
2. Check API keys in `app.json`
3. Ensure Firebase services are enabled
4. Verify network connectivity

### Issue 6: Permission errors on Windows
**Solution**:
1. Run terminal as Administrator
2. Check Windows Defender settings
3. Ensure proper file permissions

## 📱 Testing the Application

### 1. **Basic Functionality Test**
- Launch the app
- Navigate through different screens
- Test user authentication (if implemented)
- Verify data loading and display

### 2. **Platform-Specific Testing**
- **Android**: Test on different screen sizes and Android versions
- **iOS**: Test on different iPhone models and iOS versions
- **Web**: Test in different browsers

### 3. **Performance Testing**
- Monitor app performance
- Check memory usage
- Test with slow network connections

## 🚀 Building for Production

### Building with EAS Build

1. **Login to Expo**:
   ```bash
   eas login
   ```

2. **Configure EAS**:
   ```bash
   eas build:configure
   ```

3. **Build for Android**:
   ```bash
   eas build --platform android --profile production
   ```

4. **Build for iOS**:
   ```bash
   eas build --platform ios --profile production
   ```

### Local Building (Advanced)

#### Android APK
```bash
npx expo run:android --variant release
```

#### iOS (macOS only)
```bash
npx expo run:ios --configuration Release
```

## 📚 Additional Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)

### Useful Commands
```bash
# Check Expo installation
npx expo --version

# Check project health
npx expo doctor

# Clear all caches
npx expo start --clear

# Install specific Expo SDK
npx expo install --fix

# Check for outdated dependencies
npx expo install --check
```

### Development Tips
1. **Use Expo Go** for quick testing during development
2. **Enable hot reloading** for faster development cycles
3. **Use TypeScript** for better code quality
4. **Test on real devices** for accurate performance testing
5. **Use Expo Dev Tools** for debugging

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. **Check the logs**: Look at terminal output for error messages
2. **Expo Documentation**: Visit [docs.expo.dev](https://docs.expo.dev/)
3. **GitHub Issues**: Check the repository's issue tracker
4. **Community Support**: Join Expo Discord or React Native community forums

## 📝 Project Structure Overview

```
HealthPathCoach/
├── app/                    # App screens and routing (Expo Router)
├── components/             # Reusable UI components
├── services/              # API and external service integrations
├── hooks/                  # Custom React hooks
├── constants/              # Application constants
├── assets/                 # Images, fonts, and other assets
├── styles/                 # Global styles and themes
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── app.json               # Expo configuration
├── eas.json               # EAS Build configuration
├── babel.config.js         # Babel configuration
├── metro.config.js         # Metro bundler configuration
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## ✅ Verification Checklist

Before considering the setup complete, verify:

- [ ] Repository cloned successfully
- [ ] Dependencies installed without errors
- [ ] Expo CLI installed and working
- [ ] Development server starts without errors
- [ ] App loads on target platform(s)
- [ ] Firebase configuration working (if applicable)
- [ ] Hot reloading functional
- [ ] Build process works (if testing production builds)

---

**Congratulations!** 🎉 You should now have HealthPathCoach running on your local machine. If you followed all steps correctly, you can start developing and testing the application.

For any questions or issues, refer to the troubleshooting section or reach out to the development team.
