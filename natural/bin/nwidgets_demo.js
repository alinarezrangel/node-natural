/* **************************************
*********************
*** NWidgetsDemo: Demo of all NWidgets
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
		"appname": "NWidgetsDemo",
		"appid": "nwidgets_demo",
		"pkg": "essencials",
		"source": {
			"humanReadable": "http://packages.naturalserver.io/essencials/nwidgets_demo",
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
				"url": "http://packages.naturalserver.io/essencials/nwidgets_demo"
			}
		]
	};
	NGraphCreateApplication("nwidgets_demo", "NWidgetsDemo", function(args)
	{
		var window = NGraphCreateWindow("nwidgets_demo", "NWidgetsDemo");
		var winbody = NGraphGetWindowBody(window);
		var style = NWidgetsCreateAppStyle();
		var container = document.createElement("div");
		container.className = "container no-margin";

		var menubar = NWidgetsCreateMenuBar(style);
		var menu1 = NWidgetsCreateMenu(style, "Menu 1");
		var menu2 = NWidgetsCreateMenu(style, "Menu 2");
		var menu3 = NWidgetsCreateMenu(style, "Menu 3");

		var number = NWidgetsCreateNumberInput(style, true, 0);
		var combobox = NWidgetsCreateCombobox(style, true, [
			{"name": "Option 1", "value": "1"},
			{"name": "Option 2", "value": "2"},
			{"name": "Option 3", "value": "3"},
			{"name": "Option 4", "value": "4"},
			{"name": "Option 5", "value": "5"},
			{"name": "Option 6", "value": "6"}
		]);
		var slider = NWidgetsCreateSlider(style, 0);

		var snack = NWidgetsCreateSnack(style, "I am a snack");

		NWidgetsPack(winbody, menubar);
		NWidgetsPack(winbody, container);

		NWidgetsPack(container, number);
		NWidgetsPack(container, combobox);
		NWidgetsPack(container, slider);
		NWidgetsPack(container, snack);

		NWidgetsPack(menubar, menu1);
		NWidgetsPack(menubar, menu2);
		NWidgetsPack(menubar, menu3);

		menu1.addEventListener("click", function()
		{
			NWidgetsShowSnack(snack);
		});
	});
}());
