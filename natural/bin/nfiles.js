/* **************************************
*********************
*** NFiles: the Natural file browser
*** Works with the NMG API.
*** By Alejandro Linarez Rangel
*********************
************************************** */

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
		child(treenode);
		treenode.addEventListener("click", function(ev)
		{
			onclick(ev);
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
		};
	}
	function Explode(pathexploded, treenode)
	{
		var subnode = MakeTreeNode(treenode, MakeTreeNodeChild("/images/misc/icons/dir.svg", pathexploded[0]), function() {});
		if(pathexploded.length > 1)
			Explode(pathexploded.slice(1), subnode);
		treenode.appendChild(subnode);
	}
	function ShowModal(title, text)
	{
		var modal = NGraphCreateWindow("nfiles", "NFiles - Modal - " + title);
		var text = document.createElement("p");
		text.appendChild(document.createTextNode(text));
		modal.appendChild(text);
		return modal;
	}
	function AddFileToArea(area, img, name)
	{
		var file = document.createElement("div");
		file.className = "border bs-2 margin-8 padding-8 applogo";
		file.style.width = "120px";
		file.style.height = "120px";
		var image = document.createElement("img");
		image.src = img;
		image.style.display = "block";
		image.width = 100;
		image.height = 100;
		var text = document.createElement("span");
		text.appendChild(document.createTextNode(name));
		file.appendChild(image);
		file.appendChild(text);
		area.appendChild(file);
	}
	NGraphCreateApplication("nfiles", "NFiles", function()
	{
		var window = NGraphCreateWindow("nfiles", "NFiles");
		var mypid = NGraphLoadDataFromWindow(window, "pid");
		NGraphStoraDataInWindow(window, "path", "/home/alinarez/MEGA/MEGAsync/PRogramacion-nuevo/nodejs/natural-server");
		var layout = document.createElement("section");
		layout.className = "flexible direction-row justify-start align-stretch no-wrap width-block height-block";
		var fileArea = document.createElement("div");
		fileArea.className = "f3 o1 container color-light-grey";
		var structureArea = document.createElement("div");
		structureArea.className = "f1 o2 container color-grey border border-color-everred bs-2";
		var treeView = MakeTreeView();
		Explode(NGraphLoadDataFromWindow(window, "path").split("/"), treeView);
		structureArea.appendChild(treeView);
		NaturalListDir(NGraphLoadDataFromWindow(window, "path"), mypid, function(err, files)
		{
			if(err)
			{
				ShowModal("Algo va mal!", "Algún error inesperado sucedio mientras se leia el directorio. Asegurate de detenr los permisos necesarios para la acción");
				return;
			}
			var i = 0;
			var j = files.length;
			while(fileArea.firstChild)
				fileArea.removeChild(fileArea.firstChild);
			for(i = 0; i < j; i++)
			{
				var file = files[i];
				AddFileToArea(fileArea, "/images/misc/icons/file.svg", file);
			}
		});
		layout.appendChild(fileArea);
		layout.appendChild(structureArea);
		NGraphGetWindowBody(window).appendChild(layout);
	});
}());
