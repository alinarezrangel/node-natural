/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Pure desktop event manager.
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

var PureWindows = [];
var PureApplications = [];
var PureMaxZIndex = 2;
var PureWindowGWID = 0;
var PureShowingMenu = false;
var PureWindow2Resize = null;
var PureResizeStart = []; // [x, y]
var PureResizeEnd = []; // [w, h]
var PureResizeAlign = [];

function PureMakeTextNode(text)
{
	return document.createTextNode(text);
}

function PureEmitEvent(target, name, data)
{
	var ev = new CustomEvent(name, data);
	return target.dispatchEvent(ev);
}

function PureEmitEvents(targets, name, data)
{
	var i = 0;
	var j = targets.length;
	for(i = 0; i < j; i++)
	{
		PureEmitEvent(targets[i], name, data);
	}
}

function PureExecuteTemplate(template, args)
{
	var tmp = document.importNode(template.content, true);
	var t = $(tmp);

	var classes = t.find("*[data-template-class-insert]");
	classes.each(function(index)
	{
		var node = $(this);
		node.addClass(args[node.data("templateClassInsert")]);
	});
	var texts = t.find("*[data-template-text-insert]");
	texts.each(function(index)
	{
		var node = $(this);
		node.get(0).appendChild(PureMakeTextNode(args[node.data("templateTextInsert")]));
	});

	return t.children().get(0);
}

function PureMakeDefaultWindowLayout(name, args)
{
	var win = PureExecuteTemplate(
		$("#puredesktop-window").get(0),
		args
	);
	var titlebar = $(win).find(".puredesktop-window-titlebar").get(0);
	win.style.width = "300px";
	win.style.height = "300px";
	win.style.zIndex = 1;

	PureWindowGWID += 1;

	win.id = "window_" + name + "_" + PureWindowGWID;

	$(win).data("clickX", 0);
	$(win).data("clickY", 0);
	$(win).data("mousedown", "false");
	$(win).data("movable", "false");
	$(win).data("focused", "false");
	$(win).data("instantRemove", "true");
	$(win).data("preventTitlebarMove", "false");
	$(win).data("maximized", "false");
	$(win).data("defaultTop", $(".puredesktop-top-menubar").height() + 2);
	$(win).data("defaultLeft", $(".puredesktop-left-menubar").width() + 2);
	$(win).data("defaultWidth", 300);
	$(win).data("defaultHeight", 300);
	$(win).data("title", args.title);
	$(win).data("pid", PureWindowGWID);

	var resize = function(win, to, setdef)
	{
		$(win).css({
			width: to[0] + "px",
			height: to[1] + "px",
			maxWidth: to[0] + "px",
			maxHeight: to[1] + "px"
		}).find(".puredesktop-window-content")
			.css({
				width: to[0] + "px",
				height: (to[1] - $(win).find(".puredesktop-window-titlebar").height()) + "px",
				maxWidth: to[0] + "px",
				maxHeight: (to[1] - $(win).find(".puredesktop-window-titlebar").height()) + "px"
			})
		.end();
		if(setdef)
		{
			$(win).data("defaultWidth", to[0])
			.data("defaultHeight", to[1]);
		}
	};

	win.addEventListener("exit", function(ev)
	{
		if($(this).data("instantRemove") == "true")
		{
			PureMaxZIndex -= 1;
			PureWindows.splice(parseInt($(this).data("pureIndex")), 1);
			$(this).remove();
			PureEmitEvent(this, "__pure_exit", {});
		}
	});

	win.addEventListener("opened", function(ev)
	{
		PureMaxZIndex += 1;
	});

	win.addEventListener("hide", function(ev)
	{
		$(this).addClass("hidden");
	});

	win.addEventListener("show", function(ev)
	{
		$(this).removeClass("hidden");
	});

	win.addEventListener("windowPriorityChanged", function(ev)
	{
		var iz = parseInt(this.style.zIndex);
		if(iz > 1)
			this.style.zIndex = (iz - 1) + "";
		$(this).data("focused", "false");
	});

	win.addEventListener("focus", function(ev)
	{
		if($(this).data("focused") == "false")
		{
			PureEmitEvents(PureWindows, "windowPriorityChanged", {
				"from": this
			});
			this.style.zIndex = PureMaxZIndex;
			$(this).data("focused", "true");
		}
	});

	win.addEventListener("mousedown", function(ev)
	{
		PureEmitEvent(this, "focus", {});
		if($(this).data("movable") == "true")
		{
			$(this).data("mousedown", "true");
			$(this).data("clickX", (ev.clientX - $(this).offset().left));
			$(this).data("clickY", (ev.clientY - $(this).offset().top));
			ev.preventDefault();
			return false;
		}
	});

	win.addEventListener("mouseup", function(ev)
	{
		if($(this).data("movable") == "true")
		{
			$(this).data("mousedown", "false");
			this.style.cursor = "auto";
			ev.preventDefault();
			return false;
		}
	});

	win.addEventListener("mousemove", function(ev)
	{
		if(($(this).data("mousedown") == "true") && ($(this).data("movable") == "true"))
		{
			var left = $(this).data("clickX");
			var top = $(this).data("clickY");
			var topnavtp = $(".puredesktop-top-menubar").height() + 2;
			var leftnavtp = $(".puredesktop-left-menubar").width() + 2;
			$(this).data("defaultTop", Math.max(ev.clientY - top, topnavtp));
			$(this).data("defaultLeft", Math.max(ev.clientX - left, leftnavtp));
			this.style.top = Math.max(ev.clientY - top, topnavtp) + "px";
			this.style.left = Math.max(ev.clientX - left, leftnavtp) + "px";
			this.style.cursor = "move";
			ev.preventDefault();
			return false;
		}
	});

	win.addEventListener("click", function(ev)
	{
		if($(this).data("focused") == "false")
		{
			PureEmitEvent(this, "focus", {});
			ev.preventDefault();
			return false;
		}
	});

	win.addEventListener("__pure_resize_to", function(ev)
	{
		resize(this, PureResizeEnd, true);
	});

	titlebar.addEventListener("mousedown", function()
	{
		if($(win).data("preventTitlebarMove") == "true")
			return;
		$(win).data("movable", "true");
		$(win).data("mousedown", "true");
		$(win).removeClass("puredesktop-can-select");
	});

	titlebar.addEventListener("mouseup", function()
	{
		if($(win).data("preventTitlebarMove") == "true")
			return;
		$(win).data("movable", "false");
		$(win).data("mousedown", "false");
		$(win).addClass("puredesktop-can-select");
		win.style.cursor = "auto";
	});

	$(titlebar).find(".puredesktop-btn-exit").get(0).addEventListener("click", function()
	{
		PureEmitEvent(win, "exit", {
			"edata": "window.buttons.exit:clicked"
		});
	});

	$(titlebar).find(".puredesktop-btn-move").get(0).addEventListener("mousedown", function(ev)
	{
		if($(win).data("movable") == "false")
		{
			$(this).addClass("color-light-grey");
			$(win).data("movable", "true");
			$(win).data("preventTitlebarMove", "true");
			$(win).removeClass("puredesktop-can-select");
			PureEmitEvent(win, "stackeable", {});
		}
		else
		{
			$(this).removeClass("color-light-grey");
			$(win).data("movable", "false");
			$(win).data("preventTitlebarMove", "false");
			$(win).addClass("puredesktop-can-select");
			PureEmitEvent(win, "fixeable", {});
		}
	});

	$(titlebar).find(".puredesktop-btn-min").get(0).addEventListener("click", function(ev)
	{
		PureWindow2Resize = win;
		PureResizeStart = [$(win).position().left, $(win).position().top];
		PureResizeAlign = [ev.clientX, ev.clientY];
	});

	$(titlebar).find(".puredesktop-btn-max").get(0).addEventListener("click", function()
	{
		var isMaximized = $(win).data("maximized");
		if(isMaximized == "false")
		{
			var topnavtp = $(".puredesktop-top-menubar").height() + 2;
			var leftnavtp = $(".puredesktop-left-menubar").width() + 2;
			win.style.top = topnavtp + "px";
			win.style.left = leftnavtp + "px";
			resize(win, [($(document.body).width() - leftnavtp), ($(document.body).height() - topnavtp)], false);
			$(win).data("maximized", "true");
			$(win).data("preventTitlebarMove", "true");
			PureEmitEvent(win, "maximized", {});
			PureEmitEvent(win, "fixeable", {});
		}
		else
		{
			var dt = $(win).data("defaultTop");
			var dl = $(win).data("defaultLeft");
			var dw = $(win).data("defaultWidth");
			var dh = $(win).data("defaultHeight");
			win.style.top = dt + "px";
			win.style.left = dl + "px";
			resize(win, [dw, dh], true);
			$(win).data("maximized", "false");
			$(win).data("preventTitlebarMove", "false");
		}
	});

	var li = PureWindows.push(win) - 1;

	$(win).data("pureIndex", li);

	return win;
}

function PureOpenWindow(window, args)
{
	args = args || {
		"preventFromTopbar": false
	};
	PureEmitEvent(window, "opened", {});
	$(".puredesktop-main-content").get(0).appendChild(window);
	if(!args.preventFromTopbar)
	{
		console.log("Prevent From Topbar Disabled");
		var tp = $(".puredesktop-windows-menu").get(0);
		var item = PureExecuteTemplate(
			$("#puredesktop-appitem").get(0),
			{
				"appname": $(window).data("title")
			}
		);
		item.addEventListener("click", function()
		{
			if($(window).hasClass("hidden"))
			{
				$(window).removeClass("hidden");
				PureEmitEvent(window, "focus", {});
				PureEmitEvent(window, "deiconify", {});
			}
			else
			{
				$(window).addClass("hidden");
				PureEmitEvents(PureWindows, "windowPriorityChanged", {
					"from": window
				});
				PureEmitEvent(window, "iconify", {});
			}
		});
		window.addEventListener("__pure_exit", function()
		{
			$(item).remove();
		});
		tp.appendChild(item);
	}
}

function PureGetWindowBody(window)
{
	return $(window).find(".puredesktop-window-content").get(0);
}

function PureCreateApplication(name, title, handler)
{
	return PureApplications.push({
		"name": name,
		"title": title,
		"handler": handler
	});
}

function PureOpenApplication(name, args)
{
	var i = 0;
	var j = PureApplications.length;

	for(i = 0; i < j; i++)
	{
		if(PureApplications[i].name == name)
		{
			return PureApplications[i].handler(args);
		}
	}

	return null;
}

function PureSetWindowAtom(window, name, value)
{
	$(window).data(name.toString(), value.toString());
}

function PureGetWindowAtom(window, name)
{
	if($(window).data(name) === undefined)
	{
		return null;
	}
	return $(window).data(name);
}

// NGraph Minimal API

function NGraphCreateWindow(name, title)
{
	var win = PureMakeDefaultWindowLayout(
		name,
		{
		"color": "color-natural-indigo",
		"title": title,
		"bkgcolor": "color-natural-white"
		}
	);
	PureOpenWindow(win);
	return win;
}

function NGraphGetWindowBody(window)
{
	return PureGetWindowBody(window);
}

function NGraphDestroyWindow(window)
{
	$(window).data("instantRemove", "true");
	PureEmitEvent(window, "exit", {});
	return null;
}

function NGraphWindowAddEventListener(window, eventname, handler)
{
	return window.addEventListener(eventname, handler);
}

function NGraphCreateApplication(name, title, handler)
{
	return PureCreateApplication(name, title, handler);
}

function NGraphOpenApplication(name, args)
{
	return PureOpenApplication(name, args);
}

function NGraphStoraDataInWindow(window, key, value)
{
	$(window).data(key, value);
	return window;
}

function NGraphLoadDataFromWindow(window, key)
{
	return $(window).data(key);
}

function NGraphWindowSetAtom(window, name, value)
{
	return PureSetWindowAtom(window, name, value);
}

function NGraphWindowGetAtom(window, name)
{
	return PureGetWindowAtom(window, name);
}

// End

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
			console.log("Attemting to open " + value.name);
			PureOpenApplication(value.name, undefined);
		});
		$(".puredesktop-applications-menu").get(0).appendChild(appitem);
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
			console.log("Attemting to open " + manifest.appid);
			PureOpenApplication(manifest.appid, undefined);
		});
		$(".puredesktop-applications-menu").get(0).appendChild(appitem);
	}, function()
	{
		$("#loading").addClass("hidden");
	});
};

window.addEventListener("load", function()
{
	$("*[data-locale-string]").each(function(index)
	{
		console.log("Locale.at " + PureLocaleStrings[PureLanguage][$(this).data("localeString")]);
		this.appendChild(PureMakeTextNode(PureLocaleStrings[PureLanguage][$(this).data("localeString")]))
	});
	$("#openappsmenu").click(function()
	{
		var menu = $(".puredesktop-applications-menu");
		var lm = $(".puredesktop-left-menubar").position();
		var lw = $(".puredesktop-left-menubar").width();
		var ox = 50;

		if(menu.hasClass("hidden"))
		{
			menu.removeClass("hidden")
				.css({
					"left": (lm.left + lw - ox + 2) + "px",
					"opacity": "0"
				})
				.animate({
					"left": (lm.left + lw + 2) + "px",
					"opacity": "1"
				}, 100, "linear")
			.end();
		}
		else
		{
			menu.css({
					"left": (lm.left + lw + 2) + "px",
					"opacity": "1"
				})
				.animate({
					"left": (lm.left + lw + ox + 2) + "px",
					"opacity": "0"
				}, 100, "linear", () =>
				{
					menu.addClass("hidden");
				})
			.end();
		}
	});
	$("#seeappsmenu").click(function()
	{
		var menu = $(".puredesktop-windows-menu");
		var lm = $(".puredesktop-left-menubar").position();
		var lw = $(".puredesktop-left-menubar").width();
		var ox = 50;

		if(menu.hasClass("hidden"))
		{
			menu.removeClass("hidden")
				.css({
					"left": (lm.left + lw - ox + 2) + "px",
					"opacity": "0"
				})
				.animate({
					"left": (lm.left + lw + 2) + "px",
					"opacity": "1"
				}, 100, "linear")
			.end();
		}
		else
		{
			menu.css({
					"left": (lm.left + lw + 2) + "px",
					"opacity": "1"
				})
				.animate({
					"left": (lm.left + lw + ox + 2) + "px",
					"opacity": "0"
				}, 100, "linear", () =>
				{
					menu.addClass("hidden");
				})
			.end();
		}
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

	$(".puredesktop-main-content, .puredesktop-resize-preview").contextmenu(function(ev)
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

	$(".puredesktop-left-menubar-menu").css({
		width: ($(document.body).width() - $(".puredesktop-left-menubar").width() + 2) + "px",
		height: ($(document.body).height() - $(".puredesktop-top-menubar").height() + 2) + "px",
	});

	NaturalLoadNext();
	console.log("PureDE loaded DOM " + NaturalLoadingIndex);
});
