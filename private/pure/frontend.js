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

PureCreateApplication("__purehelloworld", "Hello World", function(args)
{
	var window = PureMakeDefaultWindowLayout(
		"__purehelloworld",
		{
			"color": "color-natural-indigo",
			"title": "Hello World",
			"bkgcolor": "color-natural-indigo"
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
				f(showing);
			});
		}
	};

	$(".puredesktop-logout-button-yes").click(function()
	{
		// Show logout menu and play sound
		PureSoundLibPlay("service-logout");
		setTimeout(function()
		{
			$(".window").each(function(index)
			{
				PureDestroyWindow(this, true);
			});
			setInterval(function()
			{
				if(PureWindows.length > 0)
					return;

				NaturalHighLevelSocketCall("api.session.logout", 1, {}, function(err, data)
				{
					if(err)
					{
						console.error(err);
						alert("Error login out " + err);
						return;
					}
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
				width: x - PureResizeStart[0],
				height: y - PureResizeStart[1],
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
				}
			});
		});
		$(".puredesktop-applications-search-box").focus();
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

	NaturalLoadNext();
	NaturalLog("PureDE loaded DOM " + NaturalLoadingIndex);
});
