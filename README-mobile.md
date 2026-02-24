This project contains a web game that can be wrapped as native iOS/Android apps using Capacitor.

Quick setup steps (run in project root):

1. Install dependencies:

```bash
npm install
```

2. Install Capacitor packages (if not already installed by package.json):

```bash
npm install @capacitor/core @capacitor/cli --save-dev
```

3. Build the web app and sync with native projects:

```bash
npm run prepare:mobile
```

4. Initialize Capacitor (only once) if you haven't already:

```bash
npm run cap:init
```

5. Add Android and iOS platforms:

```bash
This project contains a web game that can be wrapped as native iOS/Android apps using Capacitor.

Quick setup steps (run in project root):

1. Install dependencies:

```bash
npm install
```

2. Install Capacitor packages (if not already installed by package.json):

```bash
npm install @capacitor/core @capacitor/cli --save-dev
```

3. Build the web app and sync with native projects:

```bash
npm run prepare:mobile
```

4. Initialize Capacitor (only once) if you haven't already:

```bash
npm run cap:init
```

5. Add Android and iOS platforms:

```bash
npx cap add android
npx cap add ios
```

6. Open native IDEs to build and run:

```bash
npm run cap:open:android  # opens Android Studio
npm run cap:open:ios      # opens Xcode (macOS only)
```

Notes:
- Keep your existing `index.html`, assets, and `dist` build output unchanged to preserve UI exactly.
- For iOS builds you must run on macOS with Xcode installed.
- Update `appId` in `capacitor.config.json` to your desired bundle identifier before submitting to stores.

Android release signing (Windows)

1. Install Java JDK (11+) so `keytool` is available and ensure `java`/`keytool` are on your PATH.

2. Generate a release keystore (example — change password and alias):

```powershell
keytool -genkeypair -v -keystore android/keystore/impostorz-release.jks -alias impostorz_key -keyalg RSA -keysize 2048 -validity 10000 -storepass YOUR_STORE_PASS -keypass YOUR_KEY_PASS -dname "CN=Impostorz, OU=Games, O=YourCompany, L=City, ST=State, C=US"
```

3. Add the signing properties to `android/gradle.properties` (create if missing) or to `~/.gradle/gradle.properties`:

```properties
RELEASE_STORE_FILE=keystore/impostorz-release.jks
RELEASE_STORE_PASSWORD=YOUR_STORE_PASS
RELEASE_KEY_ALIAS=impostorz_key
RELEASE_KEY_PASSWORD=YOUR_KEY_PASS
```

4. Build a signed AAB using Gradle (Windows):

```powershell
cd android
.\\gradlew bundleRelease
```

The generated AAB will be in `android/app/build/outputs/bundle/release/`.

AdMob setup (Android)
----------------------

1. Add your AdMob App ID to `android/app/src/main/AndroidManifest.xml` as a meta-data entry. (I already added your App ID there.)

2. Install a Capacitor AdMob plugin. Example using the community plugin:

```bash
npm install @capacitor-community/admob
npx cap sync android
```

3. Configure Ad Unit IDs in the app. In `App.tsx` you'll find constants near the top:

- `ADMOB_APP_ID` — your app id (already set to `ca-app-pub-2332552147534581~4542934482`)
- `INTERSTITIAL_AD_UNIT_ID` — replace with your Interstitial unit id
- `REWARDED_AD_UNIT_ID` — replace with your Rewarded unit id

During development you can use Google's test unit IDs:

- Interstitial test id: `ca-app-pub-3940256099942544/8691691433`
- Rewarded test id: `ca-app-pub-3940256099942544/5224354917`

4. Follow the plugin's README for additional Android manifest and Gradle changes (usually adding the App ID metadata and initialising the plugin in native code if required).

5. Rebuild the Android app in Android Studio and test the ads on the emulator or a device.

If you want, I can attempt to install and configure `@capacitor-community/admob` here and wire the plugin calls in `App.tsx` (I will need to run `npm install` and `npx cap sync` and then open Android Studio). Tell me to proceed and I'll run the steps.
