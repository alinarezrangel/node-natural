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
	var APPNAME = "NWidgetsDemo";
	var APPID = "nwidgets_demo";

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
			"user",
			"gpa"
		],
		"cspValid": true,
		"see": [
			{
				"type": "help",
				"url": "http://naturalserver.sourceforge.net/apps/" + APPID + "/"
			}
		]
	};
	NGraphCreateApplication(APPID, APPNAME, function(args)
	{
		var window = NGraphCreateWindow(APPID, APPNAME);
		var winbody = NGraphGetWindowBody(window);
		var style = NWidgetsCreateAppStyle();
		var container = NWidgetsCreateContainer(style);

		var menubar = NWidgetsCreateMenuBar(style);
		var menu1 = NWidgetsCreateMenu(style, "Menu 1");
		var menu2 = NWidgetsCreateMenu(style, "Menu 2", {
			textColor: "#000",
			menuColor: "#CEC"
		});
		var menu3 = NWidgetsCreateMenu(style, "Menu 3", {
			textColor: "#F0F",
			menuColor: "#0F0"
		});
		var menu4 = NWidgetsCreateMenu(style, "Menu 4");

		var number1 = NWidgetsCreateNumberInput(style, true, 0);
		var number2 = NWidgetsCreateNumberInput(style, true, 0, {
			mainColor: "#AAA",
			textColor: "#000",
			borderColor: "#FF0",
			successColor: "#F0F"
		});
		var number3 = NWidgetsCreateNumberInput(style, true, 0, {
			mainColor: "#FFF",
			textColor: "#0FF",
			borderColor: "#F00",
			successColor: "#A5A"
		});
		var combobox1 = NWidgetsCreateCombobox(style, true, [
			{"name": "Option 1", "value": "1"},
			{"name": "Option 2", "value": "2"},
			{"name": "Option 3", "value": "3"},
			{"name": "Option 4", "value": "4"},
			{"name": "Option 5", "value": "5"},
			{"name": "Option 6", "value": "6"}
		]);
		var combobox2 = NWidgetsCreateCombobox(style, true, [
			{"name": "Option 1", "value": "1"},
			{"name": "Option 2", "value": "2"},
			{"name": "Option 3", "value": "3"},
			{"name": "Option 4", "value": "4"},
			{"name": "Option 5", "value": "5"},
			{"name": "Option 6", "value": "6"}
		], (v) => v.value == "1", {
			mainColor: "#AAA",
			textColor: "#FF0",
			borderColor: "#0FF"
		});
		var combobox3 = NWidgetsCreateCombobox(style, true, [
			{"name": "Option 1", "value": "1"},
			{"name": "Option 2", "value": "2"},
			{"name": "Option 3", "value": "3"},
			{"name": "Option 4", "value": "4"},
			{"name": "Option 5", "value": "5"},
			{"name": "Option 6", "value": "6"}
		], (v) => v.value == "4", {
			mainColor: "#FFF",
			textColor: "#F00",
			borderColor: "#0FF"
		});
		var slider1 = NWidgetsCreateSlider(style, 0);
		var slider2 = NWidgetsCreateSlider(style, 50, {
			borderColor: "#FAA",
			sliderColor: "#AFF"
		});
		var slider3 = NWidgetsCreateSlider(style, 90, {
			borderColor: "#000",
			sliderColor: "#CCC"
		});

		var snack1 = NWidgetsCreateSnack(style, "I am a snack");
		var snack2 = NWidgetsCreateSnack(style, "I am a snack", {
			snackColor: "#CCC",
			snackTextColor: "#000"
		});
		var snack3 = NWidgetsCreateSnack(style, "I am a snack", {
			snackColor: "#1A5",
			snackTextColor: "#000"
		});

		var toast1 = NWidgetsCreateToast(style, "I am a toast");
		var toast2 = NWidgetsCreateToast(style, "I am a toast", {
			snackColor: "#CCC",
			snackTextColor: "#000"
		});
		var toast3 = NWidgetsCreateToast(style, "I am a toast", {
			snackColor: "#1A5",
			snackTextColor: "#000"
		});

		var button1 = NWidgetsCreateButton(style, "Button 1");
		var button2 = NWidgetsCreateButton(style, "Button 2", {
			textColor: "#CCC",
			buttonColor: "#2C2C2C"
		});
		var button3 = NWidgetsCreateButton(style, "Button 3", {
			textColor: "#000",
			buttonColor: "#5A1"
		});

		var subContainer = NWidgetsCreateContainer(style);

		var label1 = NWidgetsCreateLabel(style, "Label 1 (subcontainer)");
		var label2 = NWidgetsCreateLabel(style, "Label 2 (subcontainer)", {
			textColor: "#5A1"
		});
		var label3 = NWidgetsCreateLabel(style, "Label 3 (subcontainer)", {
			textColor: "#A15"
		});

		var textInput1 = NWidgetsCreateTextInput(style, "TextInput 1");
		var textInput2 = NWidgetsCreateTextInput(style, "TextInput 2", {
			mainColor: "#CCC",
			textColor: "#A15",
			borderColor: "#AEF"
		});
		var textInput3 = NWidgetsCreateTextInput(style, "TextInput 3", {
			mainColor: "#FFF",
			textColor: "#F55",
			borderColor: "#5FF"
		});

		var accordion = NWidgetsCreateAccordion(style);
		NWidgetsPack(
			accordion,
			NWidgetsCreateAccordionSection(
				style,
				"Section A",
				document.createTextNode("Hello World")
			)
		);
		NWidgetsPack(
			accordion,
			NWidgetsCreateAccordionSection(
				style,
				"Section B",
				document.createTextNode("Good bye world")
			)
		);
		NWidgetsPack(
			accordion,
			NWidgetsCreateAccordionSection(
				style,
				"Section C",
				document.createTextNode("World!!!!")
			)
		);

		NWidgetsPack(winbody, menubar);
		NWidgetsPack(winbody, container);

		NWidgetsPack(container, number1);
		NWidgetsPack(container, number2);
		NWidgetsPack(container, number3);
		NWidgetsPack(container, combobox1);
		NWidgetsPack(container, combobox2);
		NWidgetsPack(container, combobox3);
		NWidgetsPack(container, slider1);
		NWidgetsPack(container, slider2);
		NWidgetsPack(container, slider3);
		NWidgetsPack(container, snack1);
		NWidgetsPack(container, snack2);
		NWidgetsPack(container, snack3);
		NWidgetsPack(container, toast1);
		NWidgetsPack(container, toast2);
		NWidgetsPack(container, toast3);
		NWidgetsPack(container, button1);
		NWidgetsPack(container, button2);
		NWidgetsPack(container, button3);
		NWidgetsPack(container, subContainer);
		NWidgetsPack(container, textInput1);
		NWidgetsPack(container, textInput2);
		NWidgetsPack(container, textInput3);
		NWidgetsPack(container, accordion);

		NWidgetsPack(menubar, menu1);
		NWidgetsPack(menubar, menu2);
		NWidgetsPack(menubar, menu3);
		NWidgetsPack(menubar, menu4);

		NWidgetsPack(subContainer, label1);
		NWidgetsPack(subContainer, label2);
		NWidgetsPack(subContainer, label3);

		menu1.addEventListener("click", function()
		{
			NWidgetsShowSnack(snack1);
		});
		menu2.addEventListener("click", function()
		{
			NWidgetsShowSnack(snack2);
		});
		menu3.addEventListener("click", function()
		{
			NWidgetsShowSnack(snack3);
		});
		menu4.addEventListener("click", function()
		{
			NGraphDesktopNotify("Hello World", "this is a DesktopNotification", 0);
		});

		button1.addEventListener("click", function()
		{
			NWidgetsShowToast(toast1);
		});
		button2.addEventListener("click", function()
		{
			NWidgetsShowToast(toast2);
		});
		button3.addEventListener("click", function()
		{
			NWidgetsShowToast(toast3);
		});
	});
}());
