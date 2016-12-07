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
			"bkgcolor": "color-natural-white",
			"border": "bs-1",
			"bdcolor": "border-color-natural-indigo"
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
		var mainWindow = PureMakeDefaultWindowLayout("__puredesktopconfig", {
			"title": ApplicationsLocale()["desktopconfig"]["title"],
			"color": "color-natural-middlegrey",
			"bkgcolor": "color-natural-white",
			"border": "bs-1",
			"bdcolor": "border-color-natural-middlegrey"
		});
		var mainAreaGeo = PureGetWindowAreaGeometry();
		var style = NWidgetsCreateAppStyle();

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
		var makeCombobox = function(win, opts, def, id)
		{
			var c = NWidgetsCreateCombobox(style, false, opts, def);
			c.id = PureGenerateID(win, id);

			return c;
		};
		var makeNumber = function(win, initial, id)
		{
			var n = NWidgetsCreateNumberInput(style, false, initial);
			n.id = PureGenerateID(win, id);
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
			PureAllSounds, (f) => (f.value == PureSoundTheme),
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

		var submit = document.createElement("button");
		submit.className = "button color-natural-deepgreen width-block";
		submit.type = "button";
		submit.appendChild(PureMakeTextNode("Guardar"));

		submit.addEventListener("click", function()
		{
			PureGlobalAnimationDuration = parseInt(globalAnimationI.value + "");
			PureSoundTheme = NWidgetsGetComboboxValue(soundThemeI);
			PureLanguage = NIntLocaleName = NWidgetsGetComboboxValue(languageI);
		});

		var container = document.createElement("div");
		container.className = "container width-block height-block no-margin padding-8";

		var winb = PureGetWindowBody(mainWindow);

		container.appendChild(globalAnimationL);
		container.appendChild(globalAnimationI);
		container.appendChild(soundThemeL);
		NWidgetsPack(container, soundThemeI);
		container.appendChild(languageL);
		NWidgetsPack(container, languageI);
		container.appendChild(submit);
		winb.appendChild(container);
	});

	PureCreateApplication("__puredesktopaudio", ApplicationsLocale()["sounds"]["title"], function(args)
	{
		var window = PureMakeDefaultWindowLayout(
			"__puredesktopaudio",
			{
				"title": ApplicationsLocale()["sounds"]["title"],
				"bkgcolor": "color-natural-white",
				"color": "color-natural-deeporange",
				"bdcolor": "border-color-natural-deeporange",
				"border": "bs-1"
			}
		);
		var mainAreaGeo = PureGetWindowAreaGeometry();

		PureSetWindowSize(window, 600, 250, false);
		PureSetWindowPosition(
			window,
			((mainAreaGeo.width - mainAreaGeo.left) / 2) - 300,
			((mainAreaGeo.height - mainAreaGeo.top) / 2) - 125
		);
		PureOpenWindow(window);

		var style = NWidgetsCreateAppStyle();

		var mutedAudio = document.createElement("label");
		mutedAudio.className = "label text-color-aqua font-bold";
		mutedAudio.appendChild(PureMakeTextNode(ApplicationsLocale()["sounds"]["mutedlabel"]));
		var mutedI = document.createElement("input");
		mutedI.className = "input inputtext";
		var mutedSounds = document.createElement("ul");
		mutedSounds.className = "list no-style";
		var addBtn = document.createElement("button");
		addBtn.className = "button color-natural-deepgreen";
		addBtn.appendChild(PureMakeTextNode("Mute sound"));

		var update = function()
		{
			while(mutedSounds.firstChild)
				mutedSounds.removeChild(mutedSounds.firstChild);

			var i = 0;
			var j = PureSoundMuted.length;
			for(i = 0; i < j; i++)
			{
				var at = PureSoundMuted[i];
				var el = document.createElement("li");
				el.className = "padding-8 margin-2 hoverable user-cant-select";
				el.appendChild(PureMakeTextNode(at));

				el.addEventListener("click", function(i)
				{
					var index = 0;
					PureSoundMuted.forEach((v, w) =>
					{
						if(v == i)
						{
							index = w;
						}
					});
					PureSoundMuted.splice(index, 1);
					this.parentElement.removeChild(this);
				}.bind(el, at));

				mutedSounds.appendChild(el);
			}
		};

		addBtn.addEventListener("click", function()
		{
			var c = mutedI.value;
			mutedI.value = "";
			PureSoundMuted.push(c);
			update();
		});

		update();

		var winb = PureGetWindowBody(window);
		var ct = document.createElement("div");
		ct.className = "container";

		ct.appendChild(mutedAudio);
		ct.appendChild(mutedI);
		ct.appendChild(addBtn);
		ct.appendChild(mutedSounds);

		winb.appendChild(ct);
	});

	PureCreateApplication("__puredesktopbackground", ApplicationsLocale()["background"]["title"], function(args)
	{
		var window = PureMakeDefaultWindowLayout(
			"__puredesktopbackground",
			{
				"title": ApplicationsLocale()["background"]["title"],
				"bkgcolor": "color-natural-white",
				"color": "color-natural-deeporange",
				"bdcolor": "border-color-natural-deeporange",
				"border": "bs-1"
			}
		);
		var mainAreaGeo = PureGetWindowAreaGeometry();

		PureSetWindowSize(window, 600, 250, false);
		PureSetWindowPosition(
			window,
			((mainAreaGeo.width - mainAreaGeo.left) / 2) - 300,
			((mainAreaGeo.height - mainAreaGeo.top) / 2) - 125
		);
		PureOpenWindow(window);

		var style = NWidgetsCreateAppStyle();

		var winb = PureGetWindowBody(window);
		var container = NWidgetsCreateContainer(style);

		var currentLabel = NWidgetsCreateLabel(style, ApplicationsLocale()["background"]["current"]);
		var changeInput = NWidgetsCreateTextInput(
			style,
			PureFrontEndCurrentBackgroundImageData.backgroundImage
		);
		var changeLabel = NWidgetsCreateLabel(style, ApplicationsLocale()["background"]["select"]);
		var typeInput = NWidgetsCreateCombobox(
			style,
			false,
			[
				{"name": ApplicationsLocale()["background"]["cb_cover"], "value": "cover"},
				{"name": ApplicationsLocale()["background"]["cb_contains"], "value": "contains"},
				{"name": ApplicationsLocale()["background"]["cb_fills"], "value": "fills"}
			],
			(v) => v.value == PureFrontEndCurrentBackgroundImageData.backgroundType
		);
		var changeBtn = NWidgetsCreateButton(style, ApplicationsLocale()["background"]["update"]);

		NWidgetsPack(container, currentLabel);
		NWidgetsPack(container, changeInput);
		NWidgetsPack(container, changeLabel);
		NWidgetsPack(container, typeInput);
		NWidgetsPack(container, changeBtn);
		NWidgetsPack(winb, container);

		changeBtn.addEventListener("click", function()
		{
			var desk = document.getElementsByClassName("puredesktop-main-content")[0];
			var imgPath = NWidgetsGetTextInputValue(changeInput);
			var bkgType = PureFrontEndCurrentBackgroundImageData.backgroundType = NWidgetsGetComboboxValue(typeInput);
			var bkgColor = PureFrontEndCurrentBackgroundImageData.backgroundColor;

			desk.style.background = "url('/images/backgrounds/" + imgPath + "')";
			desk.style.backgroundColor = bkgColor;
			desk.style.backgroundPosition = "center";
			desk.style.backgroundAttachment = "fixed";
			desk.style.backgroundRepeat = "no-repeat"; // repeat|no-repeat
			desk.style.backgroundSize = "contains"; // cover|contains|X Y

			switch(bkgType)
			{
				case "cover":
					desk.style.backgroundRepeat = "no-repeat"; // repeat|no-repeat
					desk.style.backgroundSize = "cover"; // cover|contains|X Y
					break;
				case "contains":
					desk.style.backgroundRepeat = "no-repeat"; // repeat|no-repeat
					desk.style.backgroundSize = "contains"; // cover|contains|X Y
					break;
				case "fills":
					desk.style.backgroundRepeat = "repeat"; // repeat|no-repeat
					desk.style.backgroundSize = "50px 50px"; // cover|contains|X Y
					break;
			}

			PureFrontEndCurrentBackgroundImageData.backgroundImage = imgPath;
		});
	});
}
