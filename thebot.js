let pm2 = require('pm2');
let common = require('./common');
const random = require('random');
let cron = require('node-cron');
let tr = require('tor-request');
let defaults = require('./defaults.json');
let sleep = require("sleep");

let users = common.getUsersListSync();

if(process.argv[2] != undefined)
{
	defaults.cronEveryMin = process.argv[2];
}

console.log('I need to rest for 10 second :)');
sleep.sleep(10);

async function run(tipCounts)
{
	let username;
	if(tipCounts < defaults.maxConCurrentTip)
	{
		// console.log('run for posts');
		// console.log(users);
		if(users.length == 0)
		{
			console.log("I just did it for everyone :) literally everyone");
			users = common.getUsersListSync();
			return -3;
		}
		else
		{
			username = users[random.int(0,users.length-1)];
			users.splice(users.indexOf(username), 1);
			runPm2ForTips(username);
		}
	}
}

async function runPm2ForTips(username)
{
	pm2.connect(function(err)
	{
		if (err)
		{
			console.error(err);
			process.exit(2);
		}
		console.log("Starting Tip for" , username);
		pm2.start(
		{
			name: `tip for ${username}`,
			script: 'publish0x.js',
			args: [username],
			output: `./users/${username}/likeout.log`,
			error: `./users/${username}/likeout.log`,
			max_memory_restart: '300M',
			force: false,
			autorestart: false,
			// autorestart: true,
			// maxRestarts: 3,
			// minUptime: 10000,
			// restartDelay: 10000
		},
		function(err, apps)
		{			
			pm2.disconnect();   // Disconnects from PM2
			if (err) throw err
		});
		// console.log(users);
	});
}

tr.request('https://api.ipify.org', async function (err, res, body)
{
	if (!err && res.statusCode == 200 && defaults.useTor == true)
	{
		console.log("Tor is connected and Your public (through Tor) IP is: " + body);
		console.log(`Running every ${defaults.cronEveryMin} minutes. for ${defaults.botRunChance}`);
		if(defaults.runOnStart)
		{
			run(0);
		}
	}
	else if(defaults.useTor == false)
	{
		console.log('Running without using tor.');
		console.log(`Running every ${defaults.cronEveryMin} minutes. for ${defaults.botRunChance}`);
		if(defaults.runOnStart)
		{
			run(0);
		}
	}
	else if(err)
	{
		console.log('Well, Tor is not running on 127.0.0.1:90xx, that is sucks :))');
		console.log('You need run it on ports: 9050-9060, Set it on torrc');
		process.exit(-2);
	}
});

cron.schedule(`*/${defaults.cronEveryMin} * * * *`, async function pc()
{
	if( typeof pc.counter == 'undefined' )
	{
		pc.counter = 0;
		pc.dived = 0;
	}
	pc.counter++;
	console.log('Process Checking number:', pc.counter);
	if(random.int(1, defaults.botRunChance) == 1)
	{
		console.log('Timer Dived ...' , pc.dived++);
		pm2.list(function (err, apps)
		{
			let tipR = 0;
			for (let index = 0; index < apps.length; index++)
			{
				const element = apps[index];
				if(element.name.includes("tip"))
				{
					if(element.pm2_env.status == "online")
					{
						tipR++;
					}
				}
			}
			run(tipR);
		});
	}
});
