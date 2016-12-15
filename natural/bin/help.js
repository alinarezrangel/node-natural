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

	function CreateIconMenu(style, text, substyle)
	{
		var menu = NWidgetsCreateMenu(style, text, substyle);
		menu.classList.add("nic", "text-ultra-big");
		return menu;
	}

	function hackLinks(frame, ps)
	{
		var links = frame.contentDocument.getElementsByTagName("a");
		for(var i = 0; i < links.length; i++)
		{
			var a = links[i];

			a.addEventListener("click", function(ev)
			{
				ps(frame.contentWindow.location.href);
				ev.stopPropagation();
				ev.preventDefault();
				return false;
			}, false);
		}
	}

	NGraphCreateApplication("help", "Help", function()
	{
		var mwindow = NGraphCreateWindow("help", "Help");
		var mypid = NGraphLoadDataFromWindow(mwindow, "pid");
		var winbody = NGraphGetWindowBody(mwindow);
		var style = NWidgetsCreateAppStyle();
		var menu = NWidgetsCreateMenuBar(style);
		var flexbox = NWidgetsCreateContainer(style);
		var frame = document.createElement("iframe");
		frame.className = "box no-margin no-padding no-border width-block f1 overflow-auto";
		frame.allowFullscreen = false;
		frame.src = "/embed/docs/nodenatural/index.html";

		flexbox.classList.remove("container");
		flexbox.classList.add(
			"fcontainer",
			"direction-column",
			"justify-space-around",
			"no-wrap",
			"no-padding",
			"no-margin",
			"width-block",
			"height-block"
		);

		var reload = CreateIconMenu(style, NaturalIconSetMap["loadboard"]);
		var back = CreateIconMenu(style, NaturalIconSetMap["bareleft"]);
		//var next = CreateIconMenu(style, NaturalIconSetMap["bareright"]);

		var mhistory = [];

		NWidgetsPack(flexbox, menu);
		NWidgetsPack(menu, back);
		//NWidgetsPack(menu, next);
		NWidgetsPack(menu, reload);
		flexbox.appendChild(frame);
		NWidgetsPack(winbody, flexbox);

		reload.addEventListener("click", function()
		{
			frame.contentWindow.location.reload(true);
			hackLinks(frame, (s) => mhistory.push(s));
		});
		back.addEventListener("click", function()
		{
			if(mhistory.length == 0)
				return;
			frame.contentWindow.location.href = mhistory.pop();
			hackLinks(frame, (s) => mhistory.push(s));
		}, false);
		hackLinks(frame, (s) => mhistory.push(s));
		/* next.addEventListener("click", function()
		{
			frame.contentWindow.history.forward();
		}, false); */
	});
}());
