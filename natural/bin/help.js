/* **************************************
*********************
*** Help: browse help for Natural
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
	NaturalExports = {
		"appname": "Help",
		"appid": "help",
		"pkg": "essencials",
		"source": {
			"humanReadable": "nodenatural.essencials.help",
			"machineReadable": "bin.nodenatural.essencials.help"
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
				"url": "http://naturalserver.sourceforge.net/apps/help/"
			}
		]
	};
	NGraphCreateApplication("help", "Help", function()
	{
		var window = NGraphCreateWindow("help", "Help");
		var mypid = NGraphLoadDataFromWindow(window, "pid");
		var frame = document.createElement("iframe");
		frame.className = "box no-margin no-padding no-border width-block height-block";
		frame.allowFullscreen = false;
		frame.src = "/embed/docs/nodenatural/index.html";

		NGraphGetWindowBody(window).appendChild(frame);
	});
}());
