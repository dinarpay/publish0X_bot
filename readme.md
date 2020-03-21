:blush: :robot: publish0x.com Bot :robot: :blush:
---
Most **advanced Bot-Army** for **publish0x.com**. Designed to earn tokens automatically for publish0x.com.
You can use as **one bot** (one account) or you can give it multiple accounts (an army) to earn hundreds token per day.
Features:
* Automatic tiping
* Targeting specific articles
* Auto earn :money_with_wings:
* Autorun
* Scheduling
* Can use tor out-of-box
* And More

# Requirements
* NodeJs
* Linux Probably


# Installtion
```bash
# install nodejs, tor, google-chrome, build-essential, make, g++
git clone https://github.com/mlibre/publish0X_bot.git
sudo nano /etc/tor/torrc:
# your file should have lines like this
SocksPort 9050
SocksPort 9051
SocksPort 9052
SocksPort 9053
SocksPort 9054

sudo systemctl enable tor
sudo systemctl restart tor
npm install
sudo npm install pm2 -g
# You also may have to run:
# npm rebuild
nano defaults.json # set botRunChance and runOnStart and mostTrustedUsers and other options
# Now you need to define your users. for each user u need to create a folder like users/USERNAME
# And set the user account settings
cd users
# .......
pm2 startup
pm2 start thebot.js --name publish_bot
pm2 save
```
So the next step is. you need to set `closeTheBrow` in defaults.json to `false`.
run the bot. now you need to sign-in with your google account one time. it is last trick they used to detect bots. now revert `closeTheBrow` to `true` again. and run the bot again.

# Configuration
There two options: `Global` and `Locals`.
Global configs are located in `defaults.json`. Like `useTor`, `headlessS`, .....
User specific options are located in each user account `info.json` file.
For example there is `useTor` option in `global` and `local` both.
So if you set useTor to `true`  in `defaults.json`. you need to also set it `true` for each user you want to use tor in his `info.json`.
Using `tor` and `headless` are `false` by default, you can set them to true.

### Important Global options
```javascript
"headlessS": false,
"useTor": false
"torRange": [50,50] // tor ports. if you have SocksPort 9050 -> SocksPort 9054 then set this option to [50,54]
```

# Single User/Time run
```bash
node publish0x.js USERNAME
```

Donate
=======
Donate or .... :heartpulse:
ETH:
> 0xc9b64496986E7b6D4A68fDF69eF132A35e91838e
