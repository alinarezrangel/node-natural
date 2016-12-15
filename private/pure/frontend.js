/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Pure desktop frontend manager.
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

var PureFrontEndControlVolume = NWidgetsCreateSlider(NWidgetsCreateAppStyle(), PureSoundAudioVolume * 100);
var PureFrontEndMMediaAccordion = NWidgetsCreateAccordion(NWidgetsCreateAppStyle());
var PureFrontEndCurrentBackgroundImageData = null;
var PureDesktopUserName = "";
var PureDesktopUserLongName = "";

PureCreateApplication("__purehelloworld", "Hello World", function(args)
{
	var window = PureMakeDefaultWindowLayout(
		"__purehelloworld",
		{
			"color": "color-natural-indigo",
			"title": "Hello World",
			"bkgcolor": "color-natural-indigo",
			"border": "bs-1",
			"bdcolor": "border-color-natural-indigo"
		}
	);
	PureOpenWindow(window);

	PureGetWindowBody(window).appendChild(PureMakeTextNode("Hello World"));
});

NaturalOnLoadevent = function()
{
	PureInitInternational(function()
	{
		$("*[data-locale-string]").each(function(index)
		{
			NaturalLog("Locale.at " + PureLocaleStrings[PureLanguage][$(this).data("localeString")]);
			this.appendChild(PureMakeTextNode(PureLocaleStrings[PureLanguage][$(this).data("localeString")]))
		});

		NWidgetsPack(
			PureFrontEndMMediaAccordion,
			NWidgetsCreateAccordionSection(
				NWidgetsCreateAppStyle(),
				PureLocaleStrings[PureLanguage]["volumemenu"],
				PureFrontEndControlVolume
			)
		);

		NaturalHighLevelSocketCall(
			"api.session.user.name",
			3,
			{},
			function(err, data)
			{
				if(err)
				{
					NaturalLogErr(err);
					alert("Error getting your username")
					return;
				}

				PureDesktopUserName = data.username;
				PureDesktopUserLongName = data.longname;

				$(".puredesktop-username").get(0).appendChild(PureMakeTextNode(PureDesktopUserName));
				$(".puredesktop-userlongname").get(0).appendChild(PureMakeTextNode(PureDesktopUserLongName));
				$(".puredesktop-usertoken").get(0).appendChild(PureMakeTextNode(NaturalToken));
			}
		);

		NaturalHighLevelSocketCall("api.session.background.json", 2, {}, function(err, data)
		{
			if(err)
			{
				NaturalLogErr(err);
				alert("Error getting your background")
				return;
			}

			NaturalLog("Getted background " + JSON.stringify(data));

			var bkg = data.background;
			var imgPath = "/images/backgrounds/" + bkg.backgroundImage;
			var bkgType = bkg.backgroundType;
			var bkgColor = bkg.backgroundColor;

			var desk = $(".puredesktop-main-content").get(0);

			desk.style.background = "url('" + imgPath + "')";
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

			PureFrontEndCurrentBackgroundImageData = data.background;
		});

		PureBuiltinApps();

		PureApplications.forEach(function(value, index)
		{
			var appitem = PureExecuteTemplate(
				$("#puredesktop-appitem").get(0),
				{
					"appname": value.title
				}
			);
			appitem.addEventListener("click", function()
			{
				NaturalLog("Attemting to open " + value.name);
				PureOpenApplication(value.name, undefined);
				if(!$(".puredesktop-applications-menu").hasClass("hidden"))
				{
					$(".puredesktop-applications-search-box").focus();
				}
			});
			$(".puredesktop-applications-container").get(0).appendChild(appitem);
		});
		NaturalLoadPrograms(function(appname, manifest)
		{
			var appitem = PureExecuteTemplate(
				$("#puredesktop-appitem").get(0),
				{
					"appname": appname
				}
			);
			appitem.addEventListener("click", function()
			{
				NaturalLog("Attemting to open " + manifest.appid);
				PureOpenApplication(manifest.appid, undefined);
				if(!$(".puredesktop-applications-menu").hasClass("hidden"))
				{
					$(".puredesktop-applications-search-box").focus();
				}
			});
			$(".puredesktop-applications-container").get(0).appendChild(appitem);
		}, function()
		{
			$("#loading").addClass("hidden");
		});
		PureSoundLibPlay("service-login");
	});
};

window.addEventListener("load", function()
{
	var menuSlide = function(menu, myMenuIndex, f)
	{
		$(".puredesktop-left-menubar-menu").css({
			width: ($(document.body).width() - $(".puredesktop-left-menubar").width() + 2) + "px",
			height: ($(document.body).height() - $(".puredesktop-top-menubar").height() + 2) + "px",
		});
		NaturalLog("SM " + PureShowingMenu + ":" + PureMenuIndex);
		if((PureShowingMenu) && (PureMenuIndex != myMenuIndex))
		{
			PureSlideHMenuRightHide($(".puredesktop-left-menubar-menu:not(.hidden)"), function(_showing)
			{
				PureSlideHMenuRightShow(menu, function(showing)
				{
					PureShowingMenu = showing;
					PureMenuIndex = myMenuIndex;
					if(showing)
					{
						PureSoundLibPlay("window-slide-in");
					}
					else
					{
						PureSoundLibPlay("window-slide-out");
					}
					f(showing);
				});
			});
		}
		else
		{
			PureSlideHMenuRight(menu, function(showing)
			{
				PureShowingMenu = showing;
				PureMenuIndex = myMenuIndex;
				if(showing)
				{
					PureSoundLibPlay("window-slide-in");
				}
				else
				{
					PureSoundLibPlay("window-slide-out");
				}
				f(showing);
			});
		}
	};

	NWidgetsPack(
		$(".puredesktop-multimedia-container").get(0),
		PureFrontEndMMediaAccordion
	);

	PureFrontEndControlVolume.addEventListener("oninput", function()
	{
		var total = NWidgetsGetSliderValue(PureFrontEndControlVolume);
		PureSoundAudioVolume = total / 100;
		var level = 0;

		if(total >= 5) // 40 50
			level = 1;
		if(total >= 15) // 60 75
			level = 2;
		if(total >= 32) // 80 100
			level = 3;
		if(total >= 65) // 100
			level = 4;
		if(total >= 90) //
			level = 5;

		$(".puredesktop-volume-image").each(function()
		{
			this.src = "/images/misc/pure/volume-" + level + "5.svg";
		});
	});

	$(".puredesktop-left-menubar > .link").click(function()
	{
		PureSoundLibPlay("menu-click");
	});

	$(".puredesktop-button-tools").click(function()
	{
		PureOpenApplication("__puredesktopconfig");
	});

	$(".puredesktop-button-help").click(function()
	{
		PureOpenApplication("help");
	});

	$(".puredesktop-button-logout").click(function()
	{
		PureEmitEvent(document.getElementById("closesession"), "click", {});
	});

	$(".puredesktop-logout-button-yes").click(function()
	{
		// Show logout menu and play sound
		PureSoundLibPlay("service-logout");
		setTimeout(function()
		{
			var red = false;
			setInterval(function()
			{
				if(red)
					return;
				if(PureWindows.length > 0)
				{
					$(".window").each(function(index)
					{
						PureDestroyWindow(this, true);
					});
					return;
				}

				NaturalHighLevelSocketCall("api.session.logout", 1, {}, function(err, data)
				{
					if(err)
					{
						NaturalLogErr(err);
						alert("Error login out " + err);
						return;
					}
					red = true;
					window.location.pathname = "/logout";
				});
			}, 20);
		}, 1300);
	});

	$("#openappsmenu").click(function()
	{
		var menu = $(".puredesktop-applications-menu");
		menuSlide(menu, 1, function(showing)
		{
			if(showing)
			{
				$(".puredesktop-applications-search-box").focus();
			}
		});
	});
	$("#seeappsmenu").click(function()
	{
		var menu = $(".puredesktop-windows-menu");
		menuSlide(menu, 2, function(s) {});
	});
	$("#volumemenu").click(function()
	{
		var menu = $(".puredesktop-mmedia-menu");
		menuSlide(menu, 3, function(s) {});
	});
	$("#usermenu").click(function()
	{
		var menu = $(".puredesktop-user-menu");
		menuSlide(menu, 4, function(s) {});
	});

	$(".puredesktop-main-content, .puredesktop-resize-preview").mousemove(function(ev)
	{
		var x = ev.clientX;
		var y = ev.clientY;

		if(PureWindow2Resize != null)
		{
			var wx = $(PureWindow2Resize).position().left;
			var wy = $(PureWindow2Resize).position().top;

			$(".puredesktop-resize-preview").removeClass("hidden").css({
				left: PureResizeStart[0] + "px",
				top: PureResizeStart[1] + "px",
				width: x - PureResizeStart[0] + 3,
				height: y - PureResizeStart[1] + 3,
				zIndex: 2000
			});
			PureResizeEnd[0] = $(".puredesktop-resize-preview").width();
			PureResizeEnd[1] = $(".puredesktop-resize-preview").height();
		}
	});

	$(".puredesktop-main-content, .puredesktop-resize-preview").click(function(ev)
	{
		if(PureWindow2Resize != null)
		{
			$(".puredesktop-resize-preview").addClass("hidden");
			PureEmitEvent(PureWindow2Resize, "__pure_resize_to", {});
			PureWindow2Resize = null;
			ev.preventDefault();
			return false;
		}
	});

	$(".puredesktop-applications-search-box").keydown(function(ev)
	{
		ev.keyCode = ev.which || ev.keyCode;

		if(ev.keyCode == 13)
		{
			$(".puredesktop-applications-search-box").focus();
			if($(this).val().trim() == "")
			{
				PureEmitEvent($(".puredesktop-applications-cancel-button").get(0), "click", {});
				return false;
			}
			PureEmitEvent($(".puredesktop-applications-search-button").get(0), "click", {});
			return false;
		}
	});

	$(".puredesktop-applications-search-button").click(function(ev)
	{
		var value = $(".puredesktop-applications-search-box")
			.val()
			.trim()
			.replace("\n", " ")
			.replace("\r", " ")
			.replace("\t", " ");
		$(".puredesktop-applications-search-box").val("");
		var $searchOut = $(".puredesktop-applications-container-search-output");
		var searchOut = $searchOut.get(0);
		var $apps = $(".puredesktop-applications-container");
		var apps = $apps.get(0);
		var results = false;

		var words = value.split(" ");

		if(value == "")
		{
			PureEmitEvent($(".puredesktop-applications-cancel-button").get(0), "click", {});
			return false;
		}

		$apps.addClass("hidden");
		$searchOut.removeClass("hidden");

		while(searchOut.firstChild)
			searchOut.removeChild(searchOut.firstChild);

		PureApplications.forEach(function(current, i)
		{
			words.forEach(function(word, c)
			{
				if(current.title.search(new RegExp(word, "i")) >= 0)
				{
					var appitem = PureExecuteTemplate(
						$("#puredesktop-appitem").get(0),
						{
							"appname": current.title
						}
					);
					appitem.addEventListener("click", function()
					{
						NaturalLog("Attemting to open SR " + current.name);
						PureOpenApplication(current.name, undefined);
						$(".puredesktop-applications-search-box").focus();
					});
					searchOut.appendChild(appitem);
					results = true;
				}
			});
		});
		$(".puredesktop-applications-search-box").focus();

		if(results)
		{
			PureSoundLibPlay("search-results");
		}
		else
		{
			PureSoundLibPlay("search-results-empty");
		}
	});

	$(".puredesktop-applications-cancel-button").click(function()
	{
		var value = $(".puredesktop-applications-search-box").val();
		$(".puredesktop-applications-search-box").val("");
		var $searchOut = $(".puredesktop-applications-container-search-output");
		var searchOut = $searchOut.get(0);
		var $apps = $(".puredesktop-applications-container");
		var apps = $apps.get(0);

		while(searchOut.firstChild)
			searchOut.removeChild(searchOut.firstChild);

		$apps.removeClass("hidden");
		$searchOut.addClass("hidden");
		$(".puredesktop-applications-search-box").focus();
	});

	document.addEventListener("touchstart", function(ev)
	{
		var tc = ev.changedTouches;
		var i = 0;
		var j = tc.length;

		NaturalLog("Touch started");

		for(i = 0; i < j; i++)
		{
			var t = tc[i];

			NaturalLog("Touch start (" + i + ") at " + t.clientX + "," + t.clientY + " MOUSEDOWN");
			var et = new MouseEvent("mousedown", {
				clientX: t.clientX,
				clientY: t.clientY,
				cancelable: true
			});
			ev.target.dispatchEvent(et);
		}
	});
	document.addEventListener("touchmove", function(ev)
	{
		var tc = ev.changedTouches;
		var i = 0;
		var j = tc.length;

		NaturalLog("Touch moved");

		for(i = 0; i < j; i++)
		{
			var t = tc[i];

			NaturalLog("Touch moved (" + i + ") at " + t.clientX + "," + t.clientY + " MOUSEMOVE");
			var et = new MouseEvent("mousemove", {
				clientX: t.clientX,
				clientY: t.clientY,
				cancelable: true
			});
			ev.target.dispatchEvent(et);
		}
	});
	document.addEventListener("touchend", function(ev)
	{
		var tc = ev.changedTouches;
		var i = 0;
		var j = tc.length;
		NaturalLog("Touch ended");

		for(i = 0; i < j; i++)
		{
			var t = tc[i];

			NaturalLog("Touch ended (" + i + ") at " + t.clientX + "," + t.clientY + " MOUSEUP");
			var et = new MouseEvent("mouseup", {
				clientX: t.clientX,
				clientY: t.clientY,
				cancelable: true
			});
			ev.target.dispatchEvent(et);
		}
	});

	PureStylePanels();

	NaturalLoadNext();
	NaturalLog("PureDE loaded DOM " + NaturalLoadingIndex);
});
