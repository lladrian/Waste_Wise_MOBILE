npx expo prebuild
cd android
gradlew assembleRelease
./gradlew assembleRelease
gradlew assembleRelease -PreactNativeArchitectures=x86_64
npm uninstall react-native-worklets
npm uninstall react-native-mmkv



cd android
gradlew clean
cd ..
rm -rf android/.gradle
rm -rf android/.cxx
cd android
gradlew assembleRelease

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


