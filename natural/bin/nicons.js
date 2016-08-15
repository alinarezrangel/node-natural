/* **************************************
*********************
*** NIcons: browser for Natural Icon Set
*** Works with the NMG API.
*** By Alejandro Linarez Rangel
*********************
************************************** */

(function()
{
	NaturalExports = {
		"appname": "NIcons",
		"appid": "nicons",
		"pkg": "essencials",
		"source": {
			"humanReadable": "http://packages.naturalserver.io/essencials/nicons",
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
			"demo"
		],
		"cspValid": true,
		"see": [
			{
				"type": "help",
				"url": "http://packages.naturalserver.io/essencials/nicons"
			}
		]
	};
	NGraphCreateApplication("nicons", "NIcons", function()
	{
		var window = NGraphCreateWindow("nicons", "NIcons Demonstration");
		var mypid = NGraphLoadDataFromWindow(window, "pid");
		var icons = document.createElement("div");
		var innerText = "";
		var tryItEditor = document.createElement("div");
		icons.className = "container padding-16 no-margin nic text-ultra-big";
		icons.style.wordBreak = "break-word";
		tryItEditor.className = "container padding-16 no-margin nic text-ultra-big color-light-aqua";
		tryItEditor.contentEditable = true;
		tryItEditor.style.userSelect = "all";
		tryItEditor.style.mozUserSelect = "all";
		tryItEditor.style.msUserSelect = "all";
		tryItEditor.style.webkitUserSelect = "all";
		tryItEditor.style.minHeight = "20px";
		for(var key in NaturalIconSetMap)
		{
			innerText += NaturalIconSetMap[key] + " ";
		}
		icons.appendChild(document.createTextNode(innerText));
		NGraphGetWindowBody(window).appendChild(icons);
		NGraphGetWindowBody(window).appendChild(tryItEditor);
	});
}());
