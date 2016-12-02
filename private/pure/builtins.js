/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Pure desktop builtins apps.
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

function PureBuiltinApps()
{
	"use strict";

	console.log("Loaded builtins");

	var ApplicationsLocale = function() {return PureLocaleStrings[PureLanguage]["applications"];};

	console.log("Locale is " + JSON.stringify(ApplicationsLocale()));

	PureCreateApplication("__purewelcome", ApplicationsLocale()["welcome"]["title"], function(args)
	{
		var window = PureMakeDefaultWindowLayout("__purewelcome", {
			"title": ApplicationsLocale()["welcome"]["title"],
			"color": "color-natural-indigo",
			"bkgcolor": "color-natural-white"
		});
		var mainAreaGeo = PureGetWindowAreaGeometry();

		PureSetWindowSize(window, 600, 250, false);
		PureSetWindowPosition(
			window,
			((mainAreaGeo.width - mainAreaGeo.left) / 2) - 300,
			((mainAreaGeo.height - mainAreaGeo.top) / 2) - 125
		);
		PureOpenWindow(window);

		var titleString = ApplicationsLocale()["welcome"]["title"];
		var welcomeString = ApplicationsLocale()["welcome"]["description"];
		var buttonString = ApplicationsLocale()["buttons"]["ready"];

		var flexbox = document.createElement("div");
		var title = document.createElement("h1");
		var text = document.createElement("p");
		var closeButton = document.createElement("button");
		var innerText = document.createTextNode(welcomeString);
		var innerTitle = document.createTextNode(titleString);
		var innerButton = document.createTextNode(buttonString);

		flexbox.classList = "fcontainer center direction-column no-margin padding-8 width-block height-block";
		title.className = "text-jumbo-1 o1 font-bold centerme";
		title.style.maxWidth = "70%";
		title.style.textAlign = "center";
		title.style.margin = "auto";
		text.className = "box centerme o2 f1 padding-2";
		text.style.maxWidth = "70%";
		text.style.textAlign = "center";
		text.style.margin = "auto";
		closeButton.className = "button o3 padding-4 color-natural-indigo width-block";
		closeButton.type = "button";
		closeButton.maxWidth = "70%";
		closeButton.style.margin = "auto";

		flexbox.appendChild(title);
		flexbox.appendChild(text);
		flexbox.appendChild(closeButton);

		title.appendChild(innerTitle);
		text.appendChild(innerText);
		closeButton.appendChild(innerButton);

		PureGetWindowBody(window).appendChild(flexbox);

		closeButton.addEventListener("click", function()
		{
			PureDestroyWindow(window);
		});
	});

	PureCreateApplication("__puredesktopconfig", ApplicationsLocale()["desktopconfig"]["title"], function(args)
	{
		var mainWindow = PureMakeDefaultWindowLayout("__purewelcome", {
			"title": ApplicationsLocale()["desktopconfig"]["title"],
			"color": "color-natural-middlegrey",
			"bkgcolor": "color-natural-white"
		});
		var mainAreaGeo = PureGetWindowAreaGeometry();

		PureSetWindowSize(mainWindow, 600, 250, false);
		PureSetWindowPosition(
			mainWindow,
			((mainAreaGeo.width - mainAreaGeo.left) / 2) - 300,
			((mainAreaGeo.height - mainAreaGeo.top) / 2) - 125
		);
		PureOpenWindow(mainWindow);

		var makeLabel = function(win, text, tfor)
		{
			var l = document.createElement("label");
			l.htmlFor = PureGenerateID(win, tfor);
			l.appendChild(document.createTextNode(text));
			l.className = "width-block label text-color-natural-indigo";
			return l;
		};
		var makeCombobox = function(win, def, sel, id)
		{
			var c = document.createElement("select");
			c.className = "width-block input inputtext select";
			c.id = PureGenerateID(win, id);

			def.forEach(function(value, index)
			{
				var nd = document.createElement("option");
				nd.value = value.value;
				nd.appendChild(document.createTextNode(value.name));
				c.appendChild(nd);
			});
			return c;
		};
		var makeNumber = function(win, initial, id)
		{
			var n = document.createElement("input");
			n.type = "number";
			n.className = "width-block input inputtext number";
			n.id = PureGenerateID(win, id);
			n.value = initial;
			return n;
		};

		var globalAnimationI = makeNumber(
			mainWindow,
			PureGlobalAnimationDuration,
			"globalAnimationI"
		);
		var globalAnimationL = makeLabel(
			mainWindow,
			ApplicationsLocale()["desktopconfig"]["globalanimationduration"],
			"globalAnimationI"
		);

		var soundThemeI = makeCombobox(
			mainWindow,
			PureAllSounds, (f) => (f == PureSoundTheme),
			"soundThemeI"
		);
		var soundThemeL = makeLabel(
			mainWindow,
			ApplicationsLocale()["desktopconfig"]["soundtheme"],
			"soundThemeI"
		);

		var languageI = makeCombobox(
			mainWindow,
			PureLanguages.map((f) => ({"name": f.name, "value": f.code})),
			(f) => (f.value == PureLanguage),
			"languageI"
		);
		var languageL = makeLabel(
			mainWindow,
			ApplicationsLocale()["desktopconfig"]["language"],
			"languageI"
		);

		var container = document.createElement("div");
		container.className = "container width-block height-block no-margin padding-8";

		var winb = PureGetWindowBody(mainWindow);

		container.appendChild(globalAnimationL);
		container.appendChild(globalAnimationI);
		container.appendChild(soundThemeL);
		container.appendChild(soundThemeI);
		container.appendChild(languageL);
		container.appendChild(languageI);
		winb.appendChild(container);
	});
}
