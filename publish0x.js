"use strict"
var fs = require('fs');
var util = require('util');
const random = require('random');
const puppeteer = require('puppeteer');
let common = require('./common');
let defaults = require('./defaults.json');
let delay = require('delay');
const date = require('date-and-time');

let log_file;
let log_stdout;

let username = defaults.username.toLowerCase();
let config;
let password;
try
{
	config = require(`./users/${username}/info.json`);
	password = config.password;
} catch (error)
{
	username = null;
	console.log('Default Username does not exist');
}

if(process.argv[2] != undefined)
{
	username = process.argv[2].toLowerCase();
	config = require(`./users/${username}/info.json`);
	password = config.password;
}
if(process.argv[3] != undefined)
{
	password = process.argv[3];
}
if(username == null)
{
	console.log('There is no default username, and you didnt pass a username also');
	process.exit(0);
}

let userAgent = defaults.userAgent;
if(config.userAgent != "")
{
	userAgent = config.userAgent;
}

common.internetCheck();
common.publicIP();

if(defaults.logToFile)
{
	let logPath = `./users/${username}/likeout.log`;
	log_file = fs.createWriteStream(logPath, {flags : 'a'});
	log_stdout = process.stdout;
	console.log = function ()
	{
		log_file.write(util.format.apply(null, arguments) + '\n');
		log_stdout.write(util.format.apply(null, arguments) + '\n');
	}
	console.error = console.log;
}
console.log('\n',date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),'\n');

function preload()
{
	Object.defineProperty(navigator, "languages", {
		get: function()
		{
		return ["en-US", "en"];
		},
	});

	window.navigator.chrome = {
		runtime: {},
  	};
	delete navigator.__proto__.webdriver;
	
	Object.defineProperty(navigator, 'webdriver',
	{
		get: () => false,
	});
}

async function run()
{
	let args =
	[
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--disable-infobars',
		'--window-position=0,0',
		'--ignore-certifcate-errors',
		'--ignore-certifcate-errors-spki-list',
		`--user-agent=${userAgent}`
	];
	
	if(config.args != undefined && config.args != null && config.args.length > 0)
	{
		console.log('Adding args ...');
		args = [...args , ...config.args];
	}
	if( (config.useTor != undefined) && (config.useTor == true) && (defaults.useTor != false) )
	{
		let ra = random.int(defaults.torRange[0], defaults.torRange[1]);
		args.push(`--proxy-server=socks5://127.0.0.1:90${ra}`);
		console.log('Using Tor on' , `90${ra}`);
	}
	
	const options =
	{
		args,
		// executablePath: "/usr/bin/chromium",
		executablePath: "/usr/bin/google-chrome-stable",
		// executablePath: "/usr/bin/brave-browser",
		// executablePath: "/usr/bin/brave-nightly",
		headless: defaults.headlessS,
		ignoreHTTPSErrors: true,
		userDataDir: `./users/${username}/chromData/`
	};
	const browser = await puppeteer.launch(options);
	const page = await browser.newPage();
	await page.evaluateOnNewDocument(preload);
	// await page.setExtraHTTPHeaders({Referer: 'https://www.google.com/'});
	await page.setDefaultNavigationTimeout(50000);
	await page.setViewport(config.viewport);
	let r3;
	try
	{
		r3 = await common.goingToGooglePage(page);
	}
	catch (error)
	{
		console.log('Assertion!');
		await common.closingBrower(browser, page);
		return -2;
	}
	if(r3 == false)
	{
		console.log('Assertion!');
		await common.closingBrower(browser, page);
		return -2;
	}
	
	// console.log('Starting ... :)');
	await common.goingToMainPage(page);
	let logStat = await common.loggedInCheck(page, username);
	if(logStat == false)
	{
		let r1 = await common.login(page, config.email, password);
		if(r1 == true)
		{
			console.log('Assertion!');
			await common.closingBrower(browser, page);
			return -2;
		}
	}
	let sels = [
	`#homepage > div:nth-child(1) > div > div:nth-child(${random.int(1,2)}) > div:nth-child(${random.int(1,2)}) > div.row.post > div.col-8 > p > a`,
	`#homepage > div.mt-3.mb-3 > div:nth-child(3) > div:nth-child(${random.int(1,3)}) > div.row.post > div.col-8 > p > a`,
	`#homepage > div:nth-child(4) > div:nth-child(${random.int(1,5)}) > div:nth-child(${random.int(3,5)}) > div > div.row.post > div.col-8 > p > a`];
	while (1)
	{
		await common.randomWaitfor(page);
		await delay(3000);
		try { await page.$eval(sels[random.int(0,sels.length-1)], el => el.click()); }
		catch(error)
		{
			console.log('Error, could not click');
			continue;
		};
		await common.randomWaitfor(page);
		await delay(3000);
		break;
	}
	await common.scrols(page, 10);	
	let timerSel = "#clock";
	let timeChilds = 0;
	try { timeChilds = await page.$eval(timerSel, el => el.childElementCount ); }
	catch(error)
	{
		// console.log('No clock');
	}
	if(timeChilds > 0)
	{
		console.log('Timer is On');
	}
	else
	{
		let selector = null;
		// let selector = "#tipClaim > div > div.col-lg-3.pb-3.pt-3.my-auto > button";
		let selectors = ["#main > div:nth-child(8) > div > div > div > div > div.col-lg-3.pb-3.pt-3.my-auto > button",
		"#main > div:nth-child(7) > div > div > div > div > div.col-lg-3.pb-3.pt-3.my-auto > button"]
		selectors.forEach(async elm =>
		{
			try
			{
				await page.$eval(elm , el => el.scrollIntoView(false));
				selector = elm;
			}
			catch(error)
			{
				// console.log('No button' , error);
			}
		});
		if(selector == null)
		{
			console.log('not any tip button. they probably have changed the selector. hah');
			return await common.closingBrower(browser, page);
		}
		await common.randomWaitfor(page);
		await common.randomWaitFull(page, 1 , 3, 3000);
		try {
			await page.$eval('#tipslider', el => el.value = 20);
		} catch (error) {
			console.log('Tip Slider Log');	
		}
		try { await page.$eval(selector, el => el.click()); }
		catch(error) { console.log('Error, could not click' , error); }
		await common.randomWaitFull(page, 12 , 17, 8000);
		let rewardTExt = "";
		let rewardSel = "#main > div:nth-child(1) > div > div > div:nth-child(1) > div.col-lg-9.align-self-center > div > p";
		try { await page.$eval(rewardSel , el => el.scrollIntoView(false)); }
		catch(error) { console.log("Could not find reward Selector"); }
		try { rewardTExt = await page.$eval(rewardSel , el => el.innerText); }
		catch(error) { console.log("Could not find reward Text"); }
		console.log(rewardTExt);
	}
	await common.randomWaitfor(page);
	await delay(3000);
	console.log('Done :)');
	await common.closingBrower(browser, page);
	return "OK";
}

try
{	
	run();
}
catch (error)
{
	console.log(error);
	process.exit(-2);
}

// Page reffer google/brave,
// Pressing Tab after typing username  
// executablePath
// prevent click on hidden elemnts

// Consider copying your own browser cahch in user's brower cache
// sudo cp -r ~/.config/chromium/Profile\ 1/* /run/media/mlibre/H/projects/thebot-next-gen/publish0x/users/thegoodearth/chromData/Default/
// sudo chown -R mlibre /run/media/mlibre/H/projects/thebot-next-gen/publish0x/users/
// chmod a+rwx -R /run/media/mlibre/H/projects/thebot-next-gen/publish0x/users/
// ~/.config/chromium/

// sudo nano /etc/resolv.conf # 8.8.8.8