/* **************************************
*********************
*** NFileOpen: Opens a file based on it's extension
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
	var APPNAME = "NFileOpen";
	var APPID = "nfileopen";

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
			"nogui"
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
			"errorttl": "Argumentos insuficientes",
			"errormsg": APPNAME + " fue diseñado para usarse como una aplication sin GUI/NUI, por favor, no abra este programa desde el escritorio",
			"unknowttl": "Archivo desconocido",
			"unknowmsg": APPNAME + " no sabe como abrir este archivo",
			"openfilettl": "Abrir aplicacion",
			"selectfile": "Selecciona una aplicacion",
			"donebtn": "Abrir",
			"selectapperr": "Selecciona una aplicacion",
			"selectapp": "Debes seleccionar una aplicacion para abrir el archivo"
		},
		"en": {
			"errorttl": "Expected more arguments",
			"errormsg": APPNAME + " was designed without GUI/NUI, please, never open this application from the desktop",
			"unknowttl": "Unknow file type",
			"unknowmsg": APPNAME + " does not know how to open this file",
			"openfilettl": "Open application",
			"selectfile": "Select an application",
			"donebtn": "Open",
			"selectapperr": "Select an application",
			"selectapp": "You should select an app for open the file"
		}
	};

	function ShowAppsModal(title, msg, donemsg, selected)
	{
		var mainWindow = NGraphCreateWindow(APPID, APPNAME + " - " + title);
		var style = NWidgetsCreateAppStyle();
		var container = NWidgetsCreateContainer(style);
		var ttl1 = NWidgetsCreateLabel(style, msg);
		var btncontainer = NWidgetsCreateList(style, NWidgetsListType.UNORDERED, false);
		var btndone = NWidgetsCreateButton(style, donemsg);
		var appname = "";
		var cl = false;
		var allbtns = [];

		NWidgetsPack(NGraphGetWindowBody(mainWindow), container);
		NWidgetsPack(container, ttl1);
		NWidgetsPack(container, btncontainer);
		NWidgetsPack(container, btndone);

		NGraphWindowAddEventListener(mainWindow, "exit", function()
		{
			if(!cl)
				selected(false);
		});

		btndone.addEventListener("click", function()
		{
			selected(appname != "", appname);
			cl = true;
			NGraphDestroyWindow(mainWindow);
		});

		// If we are in Pure
		if(typeof PureApplications !== "undefined")
		{
			// List all applications and when the user clicks one, open the file with
			// it
			PureApplications.forEach((app, index) =>
			{
				var appbtn = NWidgetsCreateListItem(style, NWidgetsListType.UNORDERED);
				appbtn.classList.add("hoverable", "padding-8", "no-margin");
				allbtns.push(appbtn);

				NWidgetsPack(appbtn, NWidgetsCreateTextNode(app.title));

				appbtn.addEventListener("click", function(app)
				{
					appname = app.name;
					for(var i = 0; i < allbtns.length; i++)
					{
						allbtns[i].classList.remove("color-natural-deepgreen");
					}
					this.classList.add("color-natural-deepgreen");
				}.bind(appbtn, app));
				NWidgetsPack(btncontainer, appbtn);
			});
		}
		else
		{
			// If not, open a TextInput and when the user writes the appname open the
			// file with it
			var input = NWidgetsCreateTextInput(style, "nedit");
			NWidgetsPack(btncontainer, input);
		}
	}

	NGraphCreateApplication(APPID, APPNAME, function(args)
	{
		var pid = NGraphRequestPID(APPID, APPNAME);
		args = args || [];

		if(args.length == 0)
		{
			NGraphDesktopNotify(
				ApplicationPO[NIntLocaleName]["errorttl"],
				ApplicationPO[NIntLocaleName]["errormsg"],
				5
			);
			return;
		}

		NaturalHighLevelSocketCall("api.mime.db.lookup", pid, {
			"filename": args[0].toString()
		}, function(err, data)
		{
			if(err)
			{
				NGraphDesktopNotify(
					ApplicationPO[NIntLocaleName]["errorttl"],
					ApplicationPO[NIntLocaleName]["errormsg"],
					5
				);
				return;
			}

			var mimetype = data.mimetype;

			// TODO: make a map between MIME-types and applications for open it's
			// like NGraphOpenApplication(AppsByMIME[mimetype], [filename]);

			ShowAppsModal(
				ApplicationPO[NIntLocaleName]["openfilettl"],
				ApplicationPO[NIntLocaleName]["selectfile"],
				ApplicationPO[NIntLocaleName]["donebtn"],
				function(selected, appname)
				{
					if(selected)
					{
						NGraphOpenApplication(appname, [args[0].toString()]);
					}
					else
					{
						NGraphDesktopNotify(
							ApplicationPO[NIntLocaleName]["selectapperr"],
							ApplicationPO[NIntLocaleName]["selectapp"],
							5
						);
					}
				}
			);
		});
	});
}());
