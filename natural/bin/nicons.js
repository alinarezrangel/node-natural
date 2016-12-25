/* **************************************
*********************
*** NIcons: browser for Natural Icon Set
*** Works with the NMG API.
*** By Alejandro Linarez Rangel
*********************
************************************** */

/***************************************************************************
Copyright 2016 Alejandro Linarez Rangel

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************/

(function()
{
	var APPNAME = "NIcons";
	var APPID = "nicons";

	NaturalExports = {
		"appname": APPNAME,
		"appid": APPID,
		"pkg": "essencials",
		"source": {
			"humanReadable": "nodenatural.essencials." + APPID,
			"machineReadable": "bin.nodenatural.essencials." + APPID
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
				"url": "http://naturalserver.sourceforge.net/apps/" + APPID + "/"
			}
		]
	};

	NGraphCreateApplication(APPID, APPNAME, function()
	{
		var window = NGraphCreateWindow(APPID, "NIcons Demonstration");
		var mypid = NGraphWindowGetAtom(window, "Atom.PID");
		var icons = document.createElement("div");
		var innerText = "";
		var tryItEditor = document.createElement("div");
		icons.className = "container padding-16 no-margin nic text-ultra-big";
		icons.style.wordBreak = "break-word";
		tryItEditor.className = "container padding-16 no-margin nic text-ultra-big color-light-aqua";
		tryItEditor.contentEditable = "true";
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
