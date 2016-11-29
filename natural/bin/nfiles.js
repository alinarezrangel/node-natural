/* **************************************
*********************
*** NFiles: the Natural file browser
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
		"appname": "NFiles",
		"appid": "nfiles",
		"pkg": "essencials",
		"source": {
			"humanReadable": "http://packages.naturalserver.io/essencials/nfiles",
			"machineReadable": "http://bin.naturalserver.io/essencials/"
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
				"url": "http://packages.naturalserver.io/essencials/nfiles"
			}
		]
	};
	function MakeTreeView()
	{
		var treeview = document.createElement("div");
		treeview.className = "treeview";
		return treeview;
	}
	function MakeTreeNode(parent, child, onclick)
	{
		var treenode = document.createElement("div");
		treenode.className = "treenode treenode-hover";
		parent.classList.remove("treenode-hover");
		child(treenode).addEventListener("click", function(ev)
		{
			onclick(this, ev);
		});
		return treenode;
	}
	function MakeTreeNodeChild(image, text)
	{
		return function(treenode)
		{
			var cnt = document.createElement("span");
			var img = document.createElement("img");
			img.width = "25px";
			img.height = "25px";
			img.src = image;
			cnt.appendChild(img);
			cnt.appendChild(document.createTextNode(text));
			treenode.appendChild(cnt);
			return cnt;
		};
	}
	function Explode(pathexploded, treenode, onclick)
	{
		var subnode = MakeTreeNode(treenode, MakeTreeNodeChild("/images/misc/icons/dir.svg", pathexploded[0]), onclick);
		subnode.dataset.innerText = pathexploded[0];
		if(pathexploded.length > 1)
			Explode(pathexploded.slice(1), subnode, onclick);
		treenode.appendChild(subnode);
	}
	function ShowModal(title, text)
	{
		var modal = NGraphCreateWindow("nfiles", "NFiles - Modal - " + title);
		var textel = document.createElement("p");
		textel.appendChild(document.createTextNode(text));
		NGraphGetWindowBody(modal).appendChild(textel);
		return modal;
	}
	function AddFileToArea(area, img, name, onclick)
	{
		var file = document.createElement("div");
		file.className = "border bs-2 margin-8 padding-8 iblock";
		file.style.cursor = "pointer";
		var image = document.createElement("img");
		image.src = img;
		image.style.display = "block";
		image.width = 64;
		image.height = 64;
		var text = document.createElement("span");
		text.appendChild(document.createTextNode(name));
		file.appendChild(image);
		file.appendChild(text);
		file.addEventListener("click", onclick);
		area.appendChild(file);
	}
	NGraphCreateApplication("nfiles", "NFiles", function(args)
	{
		var window = NGraphCreateWindow("nfiles", "NFiles");
		var mypid = NGraphLoadDataFromWindow(window, "pid");
		NGraphStoraDataInWindow(window, "path", "/");
		NGraphStoraDataInWindow(window, "showhidden", "false");
		var toolbar = document.createElement("div");
		toolbar.className = "navigation color-light-aqua";
		var dirUpLink = document.createElement("span");
		dirUpLink.className = "link";
		dirUpLink.appendChild(document.createTextNode("Subir un directorio"));
		toolbar.appendChild(dirUpLink);
		var layout = document.createElement("section");
		layout.className = "flexible direction-row justify-start align-stretch no-wrap width-block";
		layout.style.height = "80%";
		var fileArea = document.createElement("div");
		fileArea.className = "f3 o1 container color-light-grey overflow-auto";
		fileArea.style.maxWidth = "80%";
		fileArea.style.height = "100%";
		var structureArea = document.createElement("div");
		structureArea.className = "f1 o2 container color-grey border border-color-everred bs-2";
		var treeView = MakeTreeView();
		structureArea.appendChild(treeView);
		var dirUp = null;
		var changedir = function()
		{
			while(treeView.firstChild)
				treeView.removeChild(treeView.firstChild);
			Explode(NGraphLoadDataFromWindow(window, "path").split("/"), treeView, function(self, ev)
			{
				var text = self.dataset.innerText;
			});
			NaturalListDir(NGraphLoadDataFromWindow(window, "path"), mypid, function(err, files)
			{
				if(err)
				{
					err.code = err.code || 500;
					if(err.code == 403)
					{
						// Unauthorized
						ShowModal("Permiso denegado", "No posees los permisos necesarios para ver este directorio");
						dirUp();
						return;
					}
					ShowModal("Algo va mal!", "Algún error inesperado sucedio mientras se leia el directorio. Asegurate de tener los permisos necesarios para la acción. Error: " + err.msg);
					return;
				}
				var i = 0;
				var j = files.length;
				while(fileArea.firstChild)
					fileArea.removeChild(fileArea.firstChild);
				for(i = 0; i < j; i++)
				{
					var file = files[i];
					var icon = "/images/misc/icons/file.svg";
					var hidden = /^\./g.test(file.filename);
					hidden = hidden || /~$/g.test(file.filename);
					hidden = hidden || /^\.natural\.manifest\.json$/g.test(file.filename);
					if(file.isDirectory)
					{
						icon = "/images/misc/icons/dir.svg";
					}
					if((NGraphLoadDataFromWindow(window, "showhidden") == "false") && (hidden))
						continue;
					AddFileToArea(fileArea, icon, file.filename, function(file, ev)
					{
						var path = NGraphLoadDataFromWindow(window, "path");
						if(file.isDirectory)
						{
							NGraphStoraDataInWindow(window, "path", path + file.filename + "/");
							//alert(path + file.filename + "/");
							changedir();
						}
						else
						{
							// Open the file with the default app for it
							NGraphOpenApplication("nfileopen", [NGraphLoadDataFromWindow(window, "path") + file.filename]);
						}
					}.bind(this, file));
				}
			});
		};
		dirUp = function()
		{
			var path = NGraphLoadDataFromWindow(window, "path").split("/");
			var newpath = path.slice(0, path.length - 2).join("/");
			//alert(newpath);
			NGraphStoraDataInWindow(window, "path", newpath + "/");
			//alert(path + file.filename + "/");
			changedir();
		};
		dirUpLink.addEventListener("click", function(ev)
		{
			dirUp();
		});
		changedir();
		layout.appendChild(fileArea);
		layout.appendChild(structureArea);
		NGraphGetWindowBody(window).appendChild(toolbar);
		NGraphGetWindowBody(window).appendChild(layout);
	});
}());
