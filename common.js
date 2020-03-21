"use strict"

const publicIp = require('public-ip');
let sleep = require("sleep");
const random = require('random');
const fs = require('fs');
const internetAvailable = require("internet-available");
let defaults = require('./defaults.json');

exports.internetCheck = async function()
{
	await internetAvailable(
	{
		// Provide maximum execution time for the verification
		timeout: 5000,
		// If it tries 5 times and it fails, then it will throw no internet
		retries: 5
  })
  .then(() =>
  {})
  .catch(() =>
  {
	  console.log("NO internet!");
	  process.exit(-2);
  });
	
}

exports.publicIP = async function()
{
	(async () =>
	{
		console.log("Our public IP is:", await publicIp.v4());
	})();
	
}

exports.UpdateListFile = async function (config)
{
	let jsonContent = JSON.stringify(config);
	fs.writeFile(`publish0x_list.json`, jsonContent, 'utf8', function (err) {
		if (err) {
			console.log("An error occured while writing JSON Object to File.");
			return console.log(err);
		}
		console.log("JSON file has been updated.");
	});
}

exports.randomWaitfor = async function (page, min=900 , max=4000)
{
	let r = random.int(min, max)
	await page.waitFor(r)
}

exports.randomSleep = async function (min=1 , max=6)
{
	let r = random.int(min, max)
	sleep.sleep(r);
}

exports.randomWaitFull = async function (page, min=1 , max=6, pd=1000)
{
	await page.waitFor(pd)
	let r = random.int(min, max)
	sleep.sleep(r)
}

exports.scrol = async function (page)
{
	let res = await page.evaluate(_ =>
	{
		let ranNum = Math.floor((Math.random() * 65) + 10);
		window.scrollBy(0, window.innerHeight + ranNum);
		return document.body.scrollHeight;
	});	
	return res;
}

exports.scrols = async function (page, time)
{
	let resS = [];
	for (let index = 0; index < time; index++)
	{
		let tmp = await exports.scrol(page);
		resS.push(tmp);
		await exports.randomWaitfor(page);
		await exports.randomWaitfor(page);
		await exports.randomWaitFull(page, 10 , 15, 8000);
		let resSLen = resS.length;		
		if(resSLen > 1)
		{
			if( (resS[resSLen-1] - resS[resSLen-2] == 0 ) )
			{
				// console.log('No More Scroll');
				return -2;
			}
		}
	}
}


exports.closingBrower = async function (browser, page)
{
	if(defaults.closeTheBrow)
	{
		let brWindows = await browser.pages();
		while(brWindows.length > 0)
		{
			await exports.randomWaitFull(page, 2 , 2, 2000);
			try { await brWindows[0].close(); }
			catch(error)
			{
				// console.log("Page close error");
			}
			brWindows = await browser.pages();
		}
		try { await page.close(); }
		catch(error)
		{
			// console.log("Page close error");
		}
		await exports.randomWaitFull(page, 2 , 2, 2000);
		try { await browser.close(); }
		catch(error)
		{
			console.log("browser close error");
		}
	}
}

exports.goingToMainPage = async function (page)
{
	try
	{
		console.log(`Openning main page`);
		try{ await page.goto('https://www.publish0x.com' , {"waitUntil" : "networkidle0"});
		}catch(error){ console.log('Error goingToMainPage, could not fully open the page'); }
		await exports.randomWaitfor(page);
		await exports.randomWaitFull(page, 2 , 5, 4000);
		return true;
	}
	catch (error)
	{
		// console.log('Error goingToMainPage' , error);
      console.log('Probably not logged in before');
		return false;
	}
}

exports.loggedInCheck = async function (page, username)
{
	try
	{
		console.log(`Checking Login status as ${username} ...`);
		let sel = `#navbarDropdown1`;
		const UN = await page.$eval(sel, el => el.innerText );				
		if (UN.toLowerCase() == username.toLowerCase())
		{
			// console.log('Already logged-In');
			return true;
		}
		console.log('Not logged-in');
		return false;
	}
	catch (error)
	{
		// console.log('Error loggedInCheck' , error);
      console.log('Probably not logged in before');
		return false;
	}
}

exports.login = async function (page, email, password)
{
	try
	{
		console.log(`Logging in as ${email} ...`);
		let sel = "#navbarToggle > ul > li:nth-child(1) > a";
		await page.click(sel , {"waitUntil" : "networkidle0"})
		await exports.randomWaitfor(page);
		await exports.randomWaitFull(page, 3 , 7, 7000);
		await page.type('#email' , email , {delay: 50});
		await exports.randomSleep(1,2);
      await page.keyboard.press("Tab");
		await page.type('#password' , password , {delay: 50});
		await exports.randomSleep(1,2);
		await page.click("#login > div:nth-child(4) > div > button" , {"waitUntil" : "networkidle0"})
		await exports.randomWaitfor(page);
		await exports.randomWaitFull(page, 3 , 8, 4000);
		return false;
	}
	catch (error)
	{
		console.log('ERROR LOGIN');
		return true;
	}
}

exports.goingToFeedingPage = async function (page)
{
	try
	{
		console.log('Going to feed page ...');
		await page.goto('https://www.publish0x.com/' , {"waitUntil" : "networkidle0"});
		await exports.randomWaitfor(page);
		await exports.randomWaitFull(page, 3 , 7, 7000);
		await exports.randomWaitFull(page, 2 , 5, 10000);
		return true;
	}
	catch (error)
	{
		console.log('ERROR goingToFeedingPage');
		return false;
	}
}

exports.goingToGooglePage = async function (page)
{
	try
	{
		console.log('Going to Google page ...');
		await page.goto('https://www.google.com/' , {"waitUntil" : "networkidle0"});
		await exports.randomWaitfor(page);
		await exports.randomWaitFull(page, 3 , 7, 7000);
		return true;
	}
	catch (error)
	{
		console.log('ERROR goingToGooglePage');
		return false;
	}
}

exports.goingToBannedPage = async function (page)
{
	try
	{
		console.log('Going to banning page ...');
		await page.goto('https://www.minds.com/settings/blocked-channels' , {"waitUntil" : "networkidle0"});
		await exports.randomWaitfor(page);
		return false;
	}
	catch (error)
	{
		console.log('ERROR goingToBannedPage');
		return true;
	}
}

exports.gettingBanList = async function (page, banList)
{
	try
	{
		console.log('Getting Ban List');
		await exports.scrols(page, 40);
		let newsfeedSelector = `body > m-app > m-body > m-settings > div > div > div.m-page--main > m-settings__blockedchannels > div > div`;
		const NuOBanned = await page.$eval(newsfeedSelector, el => el.childElementCount );
		console.log(`${NuOBanned} banned.`);
		for (let index = 1; index <= NuOBanned; index++)
		{
			const banName = await page.$eval(`body > m-app > m-body > m-settings > div > div > div.m-page--main > m-settings__blockedchannels > div > div > div:nth-child(${index}) > div.m-settingsBlockedChannelsChannel__Username > a`, el => el.innerText );
			banList.push(banName);
		}
		await exports.randomWaitfor(page);
		await exports.randomWaitFull(page, 2 , 5, 10000);
		return false;
	}
	catch (error)
	{
		console.log('ERROR gettingBanList', error);
		return true;
	}
}

exports.getUsersList = function ()
{
	let users = [];		
	try
	{
		let userDirPath = './users';
		return fs.readdirSync(userDirPath);		
	}
	catch (error)
	{
		console.log('ERROR getUsersList', error);
		return false;
	}
}

exports.getUsersListSync = function ()
{
	try
	{
		let userDirPath = './users';
		return fs.readdirSync(userDirPath);		
	}
	catch (error)
	{
		console.log('ERROR getUsersList', error);
		return false;
	}
}

exports.getLogSync = function (username)
{
	try
	{
		let userDirPath = `./users/${username}/likeout.log`;
		var data = fs.readFileSync(userDirPath, 'utf8');
		return data;
	}
	catch (error)
	{
		console.log('ERROR getLogSync', error);
		return false;
	}
}
