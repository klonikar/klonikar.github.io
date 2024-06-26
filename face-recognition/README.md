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
# Powershell
$env:ANDROID_HOME="C:\Android\SDK"
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-11.0.16.101-hotspot"
$env:Path="$env:JAVA_HOME\bin;" + $env:Path

# Install gradle from https://gradle.org/install
$env:Path="C:\gradle\gradle-8.7\bin;" + $env:Path
```

```
rem cmd window
set ANDROID_HOME="C:\Android\SDK"
set JAVA_HOME="C:\Program Files\Microsoft\jdk-11.0.16.101-hotspot"
path="%JAVA_HOME%\bin";%path%

rem Install gradle from https://gradle.org/install
path="C:\gradle\gradle-8.7\bin";%path%
```

```
# Mac/Unix shell
export ANDROID_HOME="${HOME}/Android/SDK"
export JAVA_HOME=${HOME}/java # OR whereever java is installed
export PATH="${JAVA_HOME}/bin":$PATH

# Install gradle from https://gradle.org/install
export PATH="${HOME}/gradle/gradle-8.7/bin":$PATH
```

Install cordova, then (in the same powershell window where you set the env variables):
   * `cordova platform add android`
   * `cordova build android`
   * If your phone is connected to the computer, then `cordova run android`

# Sync with CouchDB
   * Install CouchDB using instructions on https://docs.couchdb.org/en/stable/install/index.html
   * If you are on windows, Use WSL2 and follow Ubuntu/Linux instructions. DO NOT Install on Windows
   * Enable HTTPS (SSL): https://docs.couchdb.org/en/stable/config/http.html#https-ssl-tls-options
   * To access WSL2 port from outside the windows machine: Follow https://stackoverflow.com/questions/61002681/connecting-to-wsl2-server-via-local-network
   * Find WSL2 IP Address: On bash prompt: `ifconfig`. It can be something like `172.19.15.161` for `eth0` interface.
   * Then run the following commands on Administrator powershell/cmd prompt.

```
netsh interface portproxy add v4tov4 listenport=6984 listenaddress=0.0.0.0 connectport=6984 connectaddress=<WSL2_IPAddr>
netsh advfirewall firewall add rule name="Allowing LAN connections" dir=in action=allow protocol=TCP localport=6984
```
