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

# Instructions for ubuntu 24.04
```
sudo apt update && sudo apt install -y curl apt-transport-https gnupg
curl https://couchdb.apache.org/repo/keys.asc | gpg --dearmor | sudo tee /usr/share/keyrings/couchdb-archive-keyring.gpg >/dev/null 2>&1
source /etc/os-release
echo "deb [signed-by=/usr/share/keyrings/couchdb-archive-keyring.gpg trusted=yes] https://apache.jfrog.io/artifactory/couchdb-deb/ ${VERSION_CODENAME} main" \
    | sudo tee /etc/apt/sources.list.d/couchdb.list >/dev/null
sudo apt install -y couchdb # does not work
```
## Needs to be installed from source

https://stackoverflow.com/questions/53769223/how-to-install-libmozjs185-dev-in-bionic

```
curl -LO http://archive.ubuntu.com/ubuntu/pool/main/libf/libffi/libffi6_3.2.1-8_amd64.deb
sudo dpkg -i libffi6_3.2.1-8_amd64.deb
wget http://launchpadlibrarian.net/309343863/libmozjs185-1.0_1.8.5-1.0.0+dfsg-7_amd64.deb
wget http://launchpadlibrarian.net/309343864/libmozjs185-dev_1.8.5-1.0.0+dfsg-7_amd64.deb
sudo dpkg --force-depends -i libmozjs185-1.0_1.8.5-1.0.0+dfsg-7_amd64.deb
sudo dpkg --force-depends -i libmozjs185-dev_1.8.5-1.0.0+dfsg-7_amd64.deb

sudo apt-get --no-install-recommends -y install \
    build-essential pkg-config erlang \
    libicu-dev

sudo apt install -y git

#wget -O couchdb-3.3.3.post4.tar.gz https://github.com/apache/couchdb/archive/refs/tags/3.3.3.post4.tar.gz
#tar zxvf couchdb-3.3.3.post4.tar.gz
#cd couchdb-3.3.4.post4
#./configure --spidermonkey-version 1.8.5

git clone https://github.com/apache/couchdb.git
cd couchdb
git switch --detach tags/3.3.3.post4
# install nvm
#https://www.geeksforgeeks.org/how-to-install-nvm-on-ubuntu-22-04/
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install v16.20.2
nvm use v16.20.2
sudo apt install python3.12-venv
./configure
make release
# After successfull build, its available in rel/couchdb/bin
# edit rel/couchdb/etc/local.ini. Uncomment the last line in [admins] section and change password on the last line to admin
# Enable HTTPS (SSL): https://docs.couchdb.org/en/stable/config/http.html#https-ssl-tls-options
# In [chttpd] section, uncomment bind_address line and change it to 0.0.0.0
# In [chttpd] section, add the following line: enable_cors = true 
rel/couchdb/bin/couchdb
# from the browser access https://localhost:6984/_utils and login with admin/admin
# Firewall port
sudo apt install ufw
sudo ufw enable
# enable cors on couchdb: https://pouchdb.com/errors.html
npm install -g add-cors-to-couchdb
export NODE_TLS_REJECT_UNAUTHORIZED='0'
npm config set strict-ssl=false
add-cors-to-couchdb https://localhost:6984 -u admin -p admin
# Install in a separate user account: https://github.com/apache/couchdb/blob/main/INSTALL.Unix.md
#sudo adduser --system \
#        --home /opt/couchdb \
#        --no-create-home \
#        --shell /bin/bash \
#        --group --gecos \
#        "CouchDB Administrator" couchdb
#sudo mkdir /opt/couchdb
#sudo chown couchdb:couchdb /opt/couchdb
#sudo passwd couchdb
#chmod -R 755 $HOME
#sudo chown couchdb:couchdb rel/couchdb/cert/*
#su - couchdb
#cp -R /home/inicai/couchdb/rel/couchdb/* .
# edit etc/local.ini and change paths to cert_file and key_file to /opt/couchdb/cert/
# use https://docs.couchdb.org/en/stable/install/unix.html with user as inicai instead of couchdb
sudo apt install -y runit
sudo mkdir /var/log/couchdb
sudo mkdir -p /etc/sv/couchdb/log
sudo chown inicai:inical /var/log/couchdb
sudo cat <<EOF >> /etc/sv/couchdb/log/run
#!/bin/sh
exec svlogd -tt /var/log/couchdb
EOF

sudo cat <<EOF >> /etc/sv/couchdb/run
#!/bin/sh
export HOME=/home/inicai
exec 2>&1
exec chpst -u inicai /home/inicai/couchdb/rel/couchdb/bin/couchdb
EOF

sudo chmod u+x /etc/sv/couchdb/log/run
sudo chmod u+x /etc/sv/couchdb/run
sudo ln -s /etc/sv/couchdb/ /etc/service/couchdb
# In a few seconds runit will discover a new symlink and start CouchDB.
# You can control CouchDB service like this:
sudo sv status couchdb
sudo sv stop couchdb
sudo sv start couchdb
```

