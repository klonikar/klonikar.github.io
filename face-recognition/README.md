# face-api.js-app
cordova app for the browser demos of face-api.js https://github.com/justadudewhohacks/face-api.js

Thanks to [Vincent Mühler](https://github.com/justadudewhohacks) for this great javascript library.

The only major change is monkeypatching the env with custom `fetch` which prepends `https://localhost/__cdvfile_assets__/www/` before the URL (assuming all URLs are relative).

App assumes cordova 12.0.1. Not tested with other versions.

Windows:

Install Android SDK (preferrably in C:\Android which ensures there is no space in the install dir path). Then run the following command only once:

```
# For cordova-android 12.x.x
"c:\Android\SDK\tools\bin\sdkmanager.bat" --install "build-tools;33.0.2"
```

Then, everytime you need to build:

```
# Powershell (Adjust env setting accordingly in cmd window)
$env:ANDROID_HOME="C:\Android\SDK"
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-11.0.16.101-hotspot"
$env:Path="C:\Program Files\Microsoft\jdk-11.0.16.101-hotspot\bin;" + $env:Path

# Install gradle from https://gradle.org/install
$env:Path="C:\gradle\gradle-8.7\bin;" + $env:Path
```

Install cordova, then (in the same powershell window where you set the env variables):
   * `cordova platform add android`
   * `cordova build android`
   * If your phone is connected to the computer, then `cordova run android`
