// overwrite the `languages` property to use a custom getter
Object.defineProperty(navigator, "languages", {
	get: function()
	{
	  return ["en-US", "en"];
	},
 });

 delete navigator.__proto__.webdriver;

 Object.defineProperty(navigator, 'webdriver',
 {
	 get: () => false,
});

