npx expo prebuild
npx expo prebuild --platform ios

cd android
gradlew assembleRelease
./gradlew assembleRelease
gradlew assembleRelease -PreactNativeArchitectures=x86_64
npm uninstall react-native-workletsa
npm uninstall react-native-mmkv



cd android
gradlew clean
cd ..
rm -rf android/.gradle
rm -rf android/.cxx
cd android
gradlew assembleRelease

./gradlew --refresh-dependencies
./gradlew clean
./gradlew assembleRelease


cd android/app
keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
android/app/my-release-key.keystore
android/app/build.gradle
signingConfigs {
    release {
        storeFile file("my-release-key.keystore")
        storePassword "YOUR_STORE_PASSWORD"
        keyAlias "my-key-alias"
        keyPassword "YOUR_KEY_PASSWORD"
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        shrinkResources false
    }
}
cd android
./gradlew assembleRelease
android/app/build/outputs/apk/release/app-release.apk

https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html#foreground.type=image&foreground.space.trim=1&foreground.space.pad=0.25&foreColor=rgba(96%2C%20125%2C%20139%2C%200)&backColor=rgb(255%2C%20255%2C%20255)&crop=0&backgroundShape=circle&effects=none&name=ic_launcher

npm install react-native-make --save-dev
npm install @bam.tech/react-native-make --save-dev
npx @bam.tech/react-native-make set-icon --path ./assets/images/logo.png



# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure EAS
eas build:configure

# 4. Build iOS in the cloud (No Mac needed!)
eas build --platform ios --profile preview

# 5. The build will be done on Expo's servers
# 6. Download the .ipa file or install via TestFlight


// Replace all $textDark500 with a specific color
<Icon as={ChevronDown} size="sm" color="#6b7280" />

// Replace all $textDark400
<Text color="#9ca3af">

// Replace all $textDark800
<Text color="#1f2937">