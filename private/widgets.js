/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Widgets for design of GUIs and NUIs.
***********************************
****************************************************************** */

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

function NWidgetsCreateAppStyle()
{
	return {
		"mainColor": "#CCC",
		"textColor": "#000"
	};
}

function NWidgetsPack(container, widget)
{
	container.appendChild(widget);
}

function NWidgetsCreateMenuBar(style)
{
	var menubar = document.createElement("div");
	menubar.className = "top-navigation";
	menubar.style.backgroundColor = style.mainColor;
	menubar.style.color = style.color;
	return menubar;
}

function NWidgetsCreateMenu(style, text)
{
	var menu = document.createElement("div");
	menu.className = "link";
	menu.style.backgroundColor = style.mainColor;
	menu.style.color = style.color;
	menu.appendChild(document.createTextNode(text));
	return menu;
}

function NWidgetsCreateSnack(style, textualContent)
{
	var snack = document.createElement("div");
	var text = document.createElement("div");
	var closebtn = document.createElement("span");
	snack.className = "snack";
	snack.style.backgroundColor = style.mainColor;
	snack.style.color = style.color;
	snack.style.display = "none";
	text.style.cssFloat = "left";
	closebtn.className = "nic text-ultra-big text-color-red";
	closebtn.style.cssFloat = "left";
	closebtn.style.marginLeft = "16px";
	closebtn.style.cursor = "pointer";
	closebtn.appendChild(document.createTextNode("e"));
	text.appendChild(document.createTextNode(textualContent));
	snack.appendChild(text);
	snack.appendChild(closebtn);
	closebtn.addEventListener("click", function(ev)
	{
		//snack.style.display = "none";
		$(snack).hide("slow");
	});
	return snack;
}

function NWidgetsShowSnack(snack)
{
	var parent = snack.parentElement;
	snack.style.bottom = "0%";
	snack.style.transform = "translateX(-50%)";
	snack.style.left = "50%";
	$(snack).show("slow");
	//snack.style.display = "block";
}
