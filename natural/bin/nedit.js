/* **************************************
*********************
*** NEdit: The Natural File Editor
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
		"appname": "NEdit",
		"appid": "nedit",
		"pkg": "essencials",
		"source": {
			"humanReadable": "nodenatural.essencials.nedit",
			"machineReadable": "bin.nodenatural.essencials.nedit"
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
				"url": "http://naturalserver.sourceforge.net/apps/nedit/"
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
			"readAs": "stringUTF8"
		}, function(err, data)
		{
			if(err)
			{
				NWidgetsShowToast(errtoast);
				callback(err);
			}
			else
			{
				callback(null, data);
			}
		});
	}

	NGraphCreateApplication("nedit", "NEdit", function(args)
	{
		args = args || [];

		var mwindow = NGraphCreateWindow("nedit", "NEdit");
		var mypid = NGraphLoadDataFromWindow(mwindow, "pid");
		var winbody = NGraphGetWindowBody(mwindow);
		var style = NWidgetsCreateAppStyle();
		var flexbox = NWidgetsCreateContainer(style);
		var menu = NWidgetsCreateMenuBar(style);
		var errordeniedtoast = NWidgetsCreateToast(style, ApplicationPO[NIntLocaleName]["denied"]);
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

		var textarea = document.createElement("textarea");
		textarea.className = "o2 f1 textarea width-block no-margin padding-4 font-monospace overflow-scroll prelike user-can-select-text font-monospace";
		textarea.value = "";
		textarea.style.resize = "none";
		textarea.style.backgroundColor = style.mainColor;
		textarea.style.color = style.textColor;

		NWidgetsPack(winbody, flexbox);
		NWidgetsPack(winbody, errordeniedtoast);
		NWidgetsPack(flexbox, menu);
		NWidgetsPack(flexbox, textarea);
		NWidgetsPack(menu, open);
		NWidgetsPack(menu, reload);
		NWidgetsPack(menu, config);
		NWidgetsPack(menu, info);
		NWidgetsPack(menu, trash);

		open.addEventListener("click", function()
		{
			NGraphOpenApplication("nfiles", [
				"--embed",
				"--title=NEdit Open File",
				"--open-with=nedit",
				"--close-after-select-file"
			]);
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

				var multilinecontent = file.filecontent.replace(/\r?\n/gmi, "\r\n");
				filesize = multilinecontent.length;

				while(textarea.firstChild)
					textarea.removeChild(textarea.firstChild);

				textarea.value = multilinecontent;
			});
		}

		NaturalImportJS(mypid, "share/taboverride", function(err, imported)
		{
			if(err)
			{
				NaturalLogErr(err);
				return;
			}

			window.tabOverride.set(textarea);
		});
	});
}());
