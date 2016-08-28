/* **************************************
*********************
*** NFiles: the Natural file browser
*** Works with the NMG API.
*** By Alejandro Linarez Rangel
*********************
************************************** */

(function()
{
	NaturalExports = {
		"appname": "NEdit",
		"appid": "nedit",
		"pkg": "essencials",
		"source": {
			"humanReadable": "http://packages.naturalserver.io/essencials/nedit",
			"machineReadable": "http://bin.naturalserver.io/essencials/"
		},
		"authors": [
			{
				"name": "Alejandro Linarez Rangel",
				"contact": "alinarezrangel@gmail.com"
			}
		],
		"autoload": true,
		"categories": [
			"system",
			"files",
			"user",
			"gpa"
		],
		"cspValid": true,
		"see": [
			{
				"type": "help",
				"url": "http://packages.naturalserver.io/essencials/nedit"
			}
		]
	};
	NGraphCreateApplication("nedit", "NEdit", function(args)
	{
		var window = NGraphCreateWindow("nedit", "NEdit");
		var mypid = NGraphLoadDataFromWindow(window, "pid");
		var winbody = NGraphGetWindowBody(window);
		var style = NWidgetsCreateAppStyle();
		var snack = NWidgetsCreateSnack(style, "Hello World");
		var button = document.createElement("button");
		button.type = "button";
		button.className = "button color-green";
		button.appendChild(document.createTextNode("Say hello"));
		winbody.appendChild(button);
		winbody.appendChild(snack);
		button.addEventListener("click", function(ev)
		{
			NWidgetsShowSnack(snack);
		});
	});
}());
