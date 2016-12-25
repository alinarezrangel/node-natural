/* **************************************
*********************
*** NPixel: Natural Image Viewer
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
	var APPNAME = "NPixel";
	var APPID = "npixel";

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

	var ApplicationPO = {
		"es": {
			"denied": "Acceso denegado al archivo"
		},
		"en": {
			"denied": "Access denied to the file"
		}
	};

	function CreateIconMenu(style, text, substyle)
	{
		var menu = NWidgetsCreateMenu(style, text, substyle);
		menu.classList.add("nic", "text-ultra-big");
		return menu;
	}

	function OpenFile(errtoast, name, pid, callback)
	{
		NaturalHighLevelSocketCall("api.file.readAll", pid, {
			"path": name,
			"readAs": "base64"
		}, function(err, data)
		{
			if(err)
			{
				NWidgetsShowSnack(errtoast);
				return callback(err);
			}

			NaturalHighLevelSocketCall("api.mime.db.lookup", pid, {
				"filename": name
			}, function(err, fdata)
			{
				if(err)
				{
					NWidgetsShowSnack(errtoast);
					return callback(err);
				}

				callback(null, {
					"filecontent": data.filecontent,
					"mimetype": fdata.mimetype
				});
			});
		});
	}

	NGraphCreateApplication(APPID, APPNAME, function(args)
	{
		args = args || [];

		var mwindow = NGraphCreateWindow(APPID, APPNAME);
		var mypid = NGraphWindowGetAtom(mwindow, "Atom.PID");
		// var importpid = NGraphRequestPID("npixel", "NPixel");
		var winbody = NGraphGetWindowBody(mwindow);
		var style = NWidgetsCreateAppStyle();
		var flexbox = NWidgetsCreateContainer(style);
		var menu = NWidgetsCreateMenuBar(style);
		var errordeniedtoast = NWidgetsCreateSnack(style, ApplicationPO[NIntLocaleName]["denied"]);
		var filesize = 0;
		var caps = false;

		flexbox.classList.add("flexible", "direction-column", "no-wrap", "no-magin", "no-padding", "width-block");
		flexbox.classList.remove("container");
		flexbox.style.height = "90%";
		menu.classList.add("o1");

		var open = CreateIconMenu(style, NaturalIconSetMap["dir"]);
		var reload = CreateIconMenu(style, NaturalIconSetMap["loadboard"]);
		var config = CreateIconMenu(style, NaturalIconSetMap["gear"]);
		var info = CreateIconMenu(style, NaturalIconSetMap["infocircle"]);
		var trash = CreateIconMenu(style, NaturalIconSetMap["trash"]);

		var image = document.createElement("img");

		image.addEventListener("load", function()
		{
			NaturalLog("Image loaded");
		});

		image.className = "o2 f1 width-block no-margin no-padding overflow-scroll user-cant-select-text user-cant-select";
		image.src = "/images/syslog.svg";
		image.width = winbody.getBoundingClientRect().width;
		image.height = winbody.getBoundingClientRect().height;
		image.style.backgroundColor = style.mainColor;
		image.style.color = style.textColor;

		NWidgetsPack(winbody, flexbox);
		NWidgetsPack(winbody, errordeniedtoast);
		NWidgetsPack(flexbox, menu);
		NWidgetsPack(flexbox, image);
		NWidgetsPack(menu, open);
		NWidgetsPack(menu, reload);
		NWidgetsPack(menu, config);
		NWidgetsPack(menu, info);
		NWidgetsPack(menu, trash);

		NGraphWindowAddEventListener(window, "resize", function(ev)
		{
			image.width = winbody.getBoundingClientRect().width;
			image.height = winbody.getBoundingClientRect().height;
		});

		open.addEventListener("click", function()
		{
			var win = NGraphOpenApplication("nfiles", [
				"--embed",
				"--title=NPixel Open File",
				"--open-with=npixel",
				"--close-after-select-file"
			]).mainWindow;
			setTimeout(function()
			{
				NGraphWindowSetFocus(win);
			}, 100);
		});

		if(args.length == 1)
		{
			OpenFile(errordeniedtoast, args[0].toString(), mypid, function(err, file)
			{
				if(err)
				{
					NaturalLogErr(err);
					return;
				}

				var multilinecontent = file.filecontent;
				filesize = multilinecontent.length;

				NaturalLog("data:" + file.mimetype + ";base64," + multilinecontent);

				image.src = "/embed/data/?data=" + encodeURIComponent("data:" + file.mimetype + ";base64," + multilinecontent);
			});
		}
	});
}());
