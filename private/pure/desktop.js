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
var PureWindowGWID = 10; // PIDs
var PureShowingMenu = false;
var PureMenuIndex = 0;
var PureWindow2Resize = null;
var PureResizeStart = []; // [x, y]
var PureResizeEnd = []; // [w, h]
var PureResizeAlign = []; // [ox, oy]
var PureResizeTimeout = false;
var PureGlobalAnimationDuration = 250;
var PureCanAnimatePanels = false;
var PureDesktopNotifies = 0;
var PureDesktopNotifiesIndex = 0;

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
	t.data("__pureTemplateConstructorDo", JSON.stringify(args));

	var classes = t.find("*[data-template-class-insert]");
	classes.each(function(index)
	{
		var node = $(this);
		var a = node.data("templateClassInsert").split(",");
		var i = 0;
		var j = a.length;

		for(i = 0; i < j; i++)
			node.addClass(args[a[i]]);
	});
	var texts = t.find("*[data-template-text-insert]");
	texts.each(function(index)
	{
		var node = $(this);
		node.get(0).appendChild(PureMakeTextNode(args[node.data("templateTextInsert")]));
	});

	return t.children().get(0);
}

function PureStylePanels()
{
	if(!PureCanAnimatePanels)
		return;

	if(PureWindows.length == 0)
	{
		// Add transparency to the panels
		$(".puredesktop-top-menubar").addClass("puredesktop-transparent");
		$(".puredesktop-left-menubar").addClass("puredesktop-transparent");
	}
	else
	{
		// Remove transparency from the panels
		$(".puredesktop-top-menubar").removeClass("puredesktop-transparent");
		$(".puredesktop-left-menubar").removeClass("puredesktop-transparent");
	}
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
	var pid = PureWindowGWID;

	win.id = "window_" + name + "_" + pid;

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
	$(win).data("pid", pid);
	$(win).data("animateResize", "false");

	var resize = function(win, to, setdef, animate, optfcn1)
	{
		optfcn1 = ((typeof optfcn1) === "undefined")? ((a, b) => a) : optfcn1;

		if(!animate)
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
		}
		else
		{
			$(win).animate(optfcn1({
				width: to[0] + "px",
				height: to[1] + "px",
				maxWidth: to[0] + "px",
				maxHeight: to[1] + "px"
			}, 1), PureGlobalAnimationDuration, function()
			{
				$(win).css({
					width: to[0] + "px",
					height: to[1] + "px",
					maxWidth: to[0] + "px",
					maxHeight: to[1] + "px"
				});
			}).find(".puredesktop-window-content")
				.animate(optfcn1({
					width: to[0] + "px",
					height: (to[1] - $(win).find(".puredesktop-window-titlebar").height()) + "px",
					maxWidth: to[0] + "px",
					maxHeight: (to[1] - $(win).find(".puredesktop-window-titlebar").height()) + "px"
				}, 2), PureGlobalAnimationDuration, function()
				{
					$(win).find(".puredesktop-window-content")
						.css({
							width: to[0] + "px",
							height: (to[1] - $(win).find(".puredesktop-window-titlebar").height()) + "px",
							maxWidth: to[0] + "px",
							maxHeight: (to[1] - $(win).find(".puredesktop-window-titlebar").height()) + "px"
						});
				});
		}
		if(setdef)
		{
			$(win).data("defaultWidth", to[0])
			.data("defaultHeight", to[1]);
		}
	};

	resize(win, [300, 300], true, false);
	$(win).css({
		"top": $(".puredesktop-top-menubar").height() + 2,
		"left": $(".puredesktop-left-menubar").width() + 2
	});

	win.__pureResizeFcn = resize;

	win.addEventListener("exit", function(ev)
	{
		if($(this).data("instantRemove") == "true")
		{
			PureEmitEvent(this, "__pure_exit", {});
		}
	});

	win.addEventListener("__pure_exit", function(ev)
	{
		PureStylePanels();
		PureSoundLibPlay("window-close");
		PureMaxZIndex -= 1;
		PureWindows.forEach(function(value, index, array)
		{
			if(value.id == win.id)
			{
				PureWindows.splice(index, 1);
				return false;
			}
		});
		$(this).remove();
	});

	win.addEventListener("opened", function(ev)
	{
		PureStylePanels();
		PureMaxZIndex += 1;
	});

	var windowHideEvent = function(ev)
	{
		PureStylePanels();
		PureSoundLibPlay("window-minimized");
		$(this).addClass("hidden");
	};
	win.addEventListener("hide", (ev) => windowHideEvent(ev));
	win.addEventListener("iconify", (ev) => windowHideEvent(ev));

	var windowShowEvent = function(ev)
	{
		PureStylePanels();
		PureSoundLibPlay("window-unminimized");
		$(this).removeClass("hidden");
	};
	win.addEventListener("show", (ev) => windowShowEvent(ev));
	win.addEventListener("deiconify", (ev) => windowShowEvent(ev));

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
		NaturalLog("Window Mouse Down Event");
		if($(this).data("focused") == "false")
		{
			PureSoundLibPlay("window-inactive-click");
			PureEmitEvent(this, "focus", {});
		}
		if($(this).data("movable") == "true")
		{
			$(this).data("mousedown", "true");
			$(this).data("clickX", (ev.clientX - $(this).offset().left));
			$(this).data("clickY", (ev.clientY - $(this).offset().top));
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
	});

	win.addEventListener("mouseup", function(ev)
	{
		NaturalLog("Window Mouse Up Event");
		if($(this).data("movable") == "true")
		{
			$(this).data("mousedown", "false");
			this.style.cursor = "auto";
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
	});

	win.addEventListener("mousemove", function(ev)
	{
		NaturalLog("Window Mouse Move Event");
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
			ev.stopPropagation();
			return false;
		}
	});

	win.addEventListener("click", function(ev)
	{
		NaturalLog("Window Mouse Click Event");
		if($(this).data("focused") == "false")
		{
			PureSoundLibPlay("window-inactive-click");
			PureEmitEvent(this, "focus", {});
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
		if($(this).data("movable") == "true")
		{
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
	});

	win.addEventListener("__pure_resize_to", function(ev)
	{
		PureSoundLibPlay("window-resize-end");
		resize(this, PureResizeEnd, true, true);
	});

	titlebar.addEventListener("mousedown", function()
	{
		NaturalLog("Title Mouse Down Event");
		if($(win).data("preventTitlebarMove") == "true")
			return;
		PureSoundLibPlay("window-move-start");
		$(win).data("movable", "true");
		$(win).data("mousedown", "true");
		$(win).removeClass("puredesktop-can-select");
	});

	titlebar.addEventListener("mouseup", function()
	{
		NaturalLog("Title Mouse Up Event");
		if($(win).data("preventTitlebarMove") == "true")
			return;
		PureSoundLibPlay("window-move-end");
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
			PureSoundLibPlay("window-move-start");
			$(this).addClass("color-light-grey");
			$(win).data("movable", "true");
			$(win).data("preventTitlebarMove", "true");
			$(win).removeClass("puredesktop-can-select");
			PureEmitEvent(win, "stackeable", {});
		}
		else
		{
			PureSoundLibPlay("window-move-end");
			$(this).removeClass("color-light-grey");
			$(win).data("movable", "false");
			$(win).data("preventTitlebarMove", "false");
			$(win).addClass("puredesktop-can-select");
			PureEmitEvent(win, "fixeable", {});
		}
	});

	$(titlebar).find(".puredesktop-btn-min").get(0).addEventListener("click", function(ev)
	{
		PureSoundLibPlay("window-resize-start");
		PureWindow2Resize = win;
		PureResizeStart = [$(win).position().left, $(win).position().top];
		PureResizeAlign = [ev.clientX, ev.clientY];
		ev.stopPropagation();
	});

	$(titlebar).find(".puredesktop-btn-max").get(0).addEventListener("click", function()
	{
		var isMaximized = $(win).data("maximized");
		if(isMaximized == "false")
		{
			PureSoundLibPlay("window-maximized");
			var topnavtp = $(".puredesktop-top-menubar").height() + 2;
			var leftnavtp = $(".puredesktop-left-menubar").width() + 2;
			// win.style.top = topnavtp + "px";
			// win.style.left = leftnavtp + "px";
			// $(win).animate({
			// "top": topnavtp,
			// "left": leftnavtp
			// }, PureGlobalAnimationDuration);
			resize(
				win,
				[
					($(document.body).width() - leftnavtp),
					($(document.body).height() - topnavtp)
				],
				false,
				true,
				function(obj, at)
			{
				if(at == 1)
				{
					obj["top"] = topnavtp + "px";
					obj["left"] = leftnavtp + "px";
				}
				return obj;
			});
			$(win).data("maximized", "true");
			$(win).data("preventTitlebarMove", "true");
			PureEmitEvent(win, "maximized", {});
			PureEmitEvent(win, "fixeable", {});
		}
		else
		{
			PureSoundLibPlay("window-unmaximized");
			var dt = $(win).data("defaultTop");
			var dl = $(win).data("defaultLeft");
			var dw = $(win).data("defaultWidth");
			var dh = $(win).data("defaultHeight");
			// win.style.top = dt + "px";
			// win.style.left = dl + "px";
			// $(win).animate({
			// "top": dt,
			// "left": dl
			// }, PureGlobalAnimationDuration);
			// resize(win, [dw, dh], true, true);
			resize(
				win,
				[
					dw,
					dh
				],
				false,
				true,
				function(obj, at)
			{
				if(at == 1)
				{
					obj["top"] = dt + "px";
					obj["left"] = dl + "px";
				}
				return obj;
			});
			$(win).data("maximized", "false");
			$(win).data("preventTitlebarMove", "false");
		}
	});

	PureWindows.push(win);

	return win;
}

function PureOpenWindow(window, args)
{
	args = args || {
		"preventFromTopbar": false
	};
	PureEmitEvent(window, "opened", {});
	PureEmitEvent(window, "focus", {});
	PureSoundLibPlay("window-new");
	$(".puredesktop-main-content").get(0).appendChild(window);
	if(!args.preventFromTopbar)
	{
		NaturalLog("Prevent From Topbar Disabled");
		var tp = $(".puredesktop-windows-menu").get(0);
		var item = PureExecuteTemplate(
			$("#puredesktop-winitem").get(0),
			{
				"appname": $(window).data("title")
			}
		);
		$(item).find(".puredesktop-label").click(function()
		{
			PureStylePanels();
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
		$(item).find(".puredesktop-btn-exit").click(function()
		{
			PureEmitEvent(window, "focus", {});
			PureEmitEvent(window, "deiconify", {});
			PureEmitEvent(window, "exit", {});
		});
		window.addEventListener("__pure_exit", function()
		{
			PureStylePanels();
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

function PureSetWindowTitle(window, title)
{
	var ttl = $(window).find(".puredesktop-title-text").get(0);
	while(ttl.firstChild)
		ttl.removeChild(ttl.firstChild);
	ttl.appendChild(PureMakeTextNode(title));
}

function PureSetWindowTitlebarColor(window, colorClass)
{
	var ttl = $(window).find(".puredesktop-window-titlebar");
	var dt = JSON.parse($(window).data("__pureTemplateConstructorDo"));
	ttl.removeClass(dt["color"]).addClass(colorClass);
	dt["color"] = colorClass;
	$(window).data("__pureTemplateConstructorDo", JSON.stringify(dt));
}

function PureSetWindowSize(window, width, height, animate)
{
	animate = ((typeof animate) === "undefined")? true : animate;

	window.__pureResizeFcn(window, [width, height], true, animate);
}

function PureSetWindowPosition(window, xpos, ypos, animate)
{
	animate = ((typeof animate) === "undefined")? true : animate;

	if(animate)
	{
		$(window).animate({
			"top": $(".puredesktop-top-menubar").height() + 2 + ypos,
			"left": $(".puredesktop-left-menubar").width() + 2 + xpos
		}, PureGlobalAnimationDuration)
		.data("defaultTop", $(".puredesktop-top-menubar").height() + 2 + ypos)
		.data("defaultLeft", $(".puredesktop-left-menubar").width() + 2 + xpos);
	}
	else
	{
		$(window).css({
			"top": $(".puredesktop-top-menubar").height() + 2 + ypos,
			"left": $(".puredesktop-left-menubar").width() + 2 + xpos
		})
		.data("defaultTop", $(".puredesktop-top-menubar").height() + 2 + ypos)
		.data("defaultLeft", $(".puredesktop-left-menubar").width() + 2 + xpos);
	}
}

function PureDestroyWindow(window, force)
{
	force = ((typeof force) === "undefined")? true : force;

	if(force)
	{
		$(window).data("instantRemove", "true");
	}
	PureEmitEvent(window, "exit", {});
}

function PureDestroyAllWindow(window)
{
	PureEmitEvent(window, "__pure_exit", {});
}

function PureWindowSetFocus(window)
{
	PureSoundLibPlay("window-attention-inactive");
	PureEmitEvent(window, "focus", {});
}

function PureGetWindowAreaGeometry()
{
	var topmenu = $(".puredesktop-top-menubar").position();
	var leftmenu = $(".puredesktop-left-menubar").position();
	var topmenuwd = $(".puredesktop-top-menubar").width();
	var topmenuhg = $(".puredesktop-top-menubar").height();
	var leftmenuwd = $(".puredesktop-left-menubar").width();
	var leftmenuhg = $(".puredesktop-left-menubar").height();
	var main = $(".puredesktop-main-content").position();
	var mainwd = $(".puredesktop-main-content").width();
	var mainhg = $(".puredesktop-main-content").height();

	var geometry = {
		"top": topmenu.top + topmenuhg + 2,
		"left": leftmenu.left + leftmenuwd + 2,
		"bottom": topmenu.top + topmenuhg + 2 + mainhg,
		"right": leftmenu.left + leftmenuwd + 2 + mainwd,
		"width": mainwd,
		"height": mainhg
	};

	return geometry;
}

function PureGenerateID(window, id)
{
	return window.id + "__" + id;
}

function PureGetPID()
{
	PureWindowGWID += 1;
	return PureWindowGWID;
}

function PureDesktopNotify(title, message, p)
{
	var osd = document.createElement("div");
	osd.className = "user-cant-select puredesktop-notify-box box color-everblack padding-16 margin-16 text-big overflow-auto";
	osd.style.color = "#EE0";
	osd.style.position = "absolute";
	osd.style.right = "16px";
	osd.style.bottom = "-30%";
	osd.style.width = "20%";
	osd.style.maxHeight = "20%";
	osd.style.cursor = "pointer";
	osd.appendChild(document.createTextNode(title));
	var msg = document.createElement("div");
	msg.className = "box no-margin no-padding no-border";
	msg.appendChild(document.createTextNode(message));
	osd.appendChild(msg);

	$(".puredesktop-main-content").get(0).appendChild(osd);

	$(osd).show().animate({
		"bottom": PureDesktopNotifies + "px"
	}, PureGlobalAnimationDuration);

	PureDesktopNotifies += $(osd).height() + 48;
	PureDesktopNotifiesIndex += 1;

	$(osd).data("puredesktopNotifyIndex", PureDesktopNotifiesIndex);

	osd.addEventListener("click", function()
	{
		PureDesktopNotifiesIndex -= 1;
		PureDesktopNotifies -= $(osd).height() + 48;
		$(osd).animate({
			"right": "-100%"
		}, PureGlobalAnimationDuration);
		$(".puredesktop-notify-box").each(function(index)
		{
			if(parseInt($(this).data("puredesktopNotifyIndex")) > parseInt($(osd).data("puredesktopNotifyIndex")))
			{
				var bt = $(osd).height() + 48;
				$(this).animate({
					"bottom": "-=" + bt + "px"
				}, PureGlobalAnimationDuration);
			}
		});
	});
}

// Animations

function PureSlideHMenu__Show(menu, callback, lm, lw, ox)
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
	callback(true);
}

function PureSlideHMenu__Hide(menu, callback, lm, lw, ox)
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
			callback(false);
		})
	.end();
}

function PureSlideHMenuRightShow(menu, callback)
{
	var lm = $(".puredesktop-left-menubar").position();
	var lw = $(".puredesktop-left-menubar").width();
	var ox = $(menu).width() / 4;

	PureSlideHMenu__Show(menu, callback, lm, lw, ox);
}

function PureSlideHMenuRightHide(menu, callback)
{
	var lm = $(".puredesktop-left-menubar").position();
	var lw = $(".puredesktop-left-menubar").width();
	var ox = $(menu).width() / 4;

	PureSlideHMenu__Hide(menu, callback, lm, lw, ox);
}

function PureSlideHMenuRight(menu, callback)
{
	if(menu.hasClass("hidden"))
	{
		PureSlideHMenuRightShow(menu, callback);
	}
	else
	{
		PureSlideHMenuRightHide(menu, callback);
	}
}

// NGraph Minimal API / Natural Universal Graphical API (NGraph)

function NGraphRequestPID(name, title)
{
	return PureGetPID();
}

function NGraphCreateWindow(name, title)
{
	var win = PureMakeDefaultWindowLayout(
		name,
		{
			"color": "color-natural-indigo",
			"title": title,
			"bkgcolor": "color-natural-white",
			"border": "bs-1",
			"bdcolor": "border-color-natural-indigo"
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

function NGraphStoreDataInWindow(window, key, value)
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

function NGraphWindowSetFocus(window)
{
	return PureWindowSetFocus(window);
}

function NGraphDesktopNotify(title, message, priority)
{
	return PureDesktopNotify(title, message, priority);
}

// End
