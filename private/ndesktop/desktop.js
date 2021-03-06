/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Default desktop event manager.
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

var NDesktopGWID = 1;
var NDesktopApplications = [];
var NDesktopMaxZIndex = 1;
var NDesktopErrorInterval = -1;
var NDesktopUsingFont = true;

jQuery.fn.extend({
	nHide: function(velocity)
	{
		this.__jqnt = this.__jqnt || {};
		this.__jqnt.__ds = this.css("display");
		this.addClass("hidden");
	},
	nShow: function(velocity)
	{
		this.__jqnt = this.__jqnt || {};
		this.removeClass("hidden");
		this.css("display", this.__jqnt.__ds);
	},
	nToggle: function(velocity)
	{
		this.__jqnt = this.__jqnt || {};
		if(this.hasClass("hidden"))
		{
			this.nShow();
		}
		else
		{
			this.nHide();
		}
	}
});

function NDesktopMakeTextTag(tag, text) // Construye un elemento del DOM tag y lo rellena con el texto text
{
	var tag = document.createElement(tag);
	tag.appendChild(document.createTextNode(text));
	return tag;
}

function NDesktopOpenWindow(name, title, contenthtml) // Crea y abre una nueva ventana.
{
	//$("#main > .window").hide();
	/*
	Los eventos personalizados de NDesktop son:
	+ `focus`: Cuando la ventana obtiene foco
	+ `iconify`: Cuando la ventana es minimizada
	+ `deiconify`: Cuando la ventana es des-minimizada
	+ `maximized`: Cuando la ventana es maximizada
	+ `resized`: Cuando la ventana cambia de tamaño
	+ `stackeable`: Cuando la ventana se puede mover
	+ `fixeable`: Cuando la ventana no se puede mover
	+ `exit`: Cuando se cierra la ventana
	+ `opened`: Cuando se abre la ventana
	+ `windowPriorityChanged`: Cuando es necesario un reajuste de los indices Z (zindex)
	*/
	var wind = document.createElement("div");
	wind.className = "window box color-white no-margin no-padding overflow-hide border border-color-black";
	wind.style.boxShadow = "10px 10px 71px 0px rgba(0, 0, 0, 0.3)";
	wind.style.width = "300px";
	wind.style.height = "300px";
	wind.style.position = "absolute";
	wind.id = "window_" + name + "_" + NDesktopGWID;
	wind.style.zIndex = NDesktopMaxZIndex;
	$(wind).data("mousedown", "false");
	$(wind).data("movable", "false");
	$(wind).data("clickX", "0");
	$(wind).data("clickY", "0");
	$(wind).data("pid", NDesktopGWID + "");
	$(wind).data("defaultWidth", "300");
	$(wind).data("defaultHeight", "300");
	$(wind).data("defaultTop", "0");
	$(wind).data("defaultLeft", "0");
	NDesktopGWID += 1; // GWID es para evitar el problema del JOS.
	contenthtml(wind); // contenthtml debe ser una funcion
	document.getElementById("main").appendChild(wind);
	NDesktopMaxZIndex += 1;
	wind.addEventListener("exit", function()
	{
		NDesktopMaxZIndex -= 1;
	});
	wind.addEventListener("windowPriorityChanged", function()
	{
		var iz = parseInt(this.style.zIndex);
		if(iz > 1)
			this.style.zIndex = (iz - 1) + "";
	});
	wind.addEventListener("mousedown", function(ev)
	{
		this.style.zIndex = "" + NDesktopMaxZIndex;
		NDesktopEmitEvents("windowPriorityChanged", document.getElementsByClassName("window"), {});
		NDesktopEmitEvent("focus", this, {});
		if($(this).data("movable") == "true")
		{
			document.body.style.userSelect = "none";
			document.body.style.mozUserSelect = "none";
			document.body.style.webkitUserSelect = "none";
			document.body.style.msUserSelect = "none";
			$(this).data("mousedown", "true");
			$(this).data("clickX", (ev.clientX - $(this).offset().left) + "");
			$(this).data("clickY", (ev.clientY - $(this).offset().top) + "");
			ev.preventDefault();
			return false;
			//console.log("At " + (ev.clientX - $(this).offset().left) + "px, " + (ev.clientY - $(this).offset().top) + "px (X,Y)");
		}
	});
	wind.addEventListener("mouseup", function(ev)
	{
		if($(this).data("movable") == "true")
		{
			document.body.style.userSelect = "all";
			document.body.style.mozUserSelect = "all";
			document.body.style.webkitUserSelect = "all";
			document.body.style.msUserSelect = "all";
			$(this).data("mousedown", "false");
			this.style.cursor = "auto";
			ev.preventDefault();
			return false;
		}
	});
	wind.addEventListener("mousemove", function(ev)
	{
		if(($(this).data("mousedown") == "true") && ($(this).data("movable") == "true"))
		{
			var left = $(this).data("clickX");
			var top = $(this).data("clickY");
			$(this).data("defaultTop", Math.max(ev.clientY - top, 56) + "");
			$(this).data("defaultLeft", (ev.clientX - left) + "");
			this.style.top = Math.max(ev.clientY - top, 56) + "px";
			this.style.left = (ev.clientX - left) + "px";
			this.style.cursor = "move";
			ev.preventDefault();
			return false;
			//$(this).data("clickX", ev.clientX + "");
			//$(this).data("clickY", ev.clientY + "");
		}
	}, false);
	return wind;
}

function NDesktopEmitEvent(name, target, data) // Emite un evento personalizado a target, data será pasado como
{ // sus atributos: data = {hola: "mundo"} entonces target.on(name, function(ev){ev.hola == "mundo"})
	var ev = new CustomEvent(name, data);
	return target.dispatchEvent(ev);
}

function NDesktopEmitEvents(name, targets, data) // Emite un evento personalizado a los targets, data será pasado como
{ // sus atributos: data = {hola: "mundo"} entonces target.on(name, function(ev){ev.hola == "mundo"})
	var ev = new CustomEvent(name, data);
	var i = 0;
	var j = targets.length;
	for(i = 0; i < j; i++)
	{
		targets[i].dispatchEvent(ev);
	}
}

function NDesktopDefaultWindowLayout(title) // Crea un layout predeterminado
{
	var header = document.createElement("header"); // Barra superior
	header.className = "container padding-4 no-margin color-light-grey window-heading";
	var content = document.createElement("div"); // Contenido
	content.className = "container padding-4 no-margin window-content overflow-auto";
	var stackeableButton = null, deiconifyButton = null, exitButton = null;
	if(!NDesktopUsingFont)
	{
		stackeableButton = document.createElement("img"); // Boton para mover la ventana
		stackeableButton.className = "padding-1 margin-1";
		stackeableButton.style.cursor = "pointer";
		stackeableButton.width = 25;
		stackeableButton.height = 25;
		stackeableButton.src = "/images/misc/stackeableButton.svg";
		stackeableButton.style.marginRight = 30;
		deiconifyButton = document.createElement("img"); // Boton para maximizar o desminimizar
		deiconifyButton.className = "padding-1 margin-1";
		deiconifyButton.style.cursor = "pointer";
		deiconifyButton.width = 25;
		deiconifyButton.height = 25;
		deiconifyButton.src = "/images/misc/deiconifyButton.svg";
		deiconifyButton.style.marginRight = 30;
		exitButton = document.createElement("img"); // Boton para cerrar la ventana
		exitButton.className = "padding-1 margin-1";
		exitButton.style.cursor = "pointer";
		exitButton.width = 25;
		exitButton.height = 25;
		exitButton.src = "/images/misc/exitButton.svg";
	}
	else
	{
		stackeableButton = document.createElement("span");
		stackeableButton.className = "padding-1 margin-1 text-ultra-big nic";
		stackeableButton.style.cursor = "pointer";
		stackeableButton.appendChild(document.createTextNode(NaturalIconSetMap["stackeable"]));
		deiconifyButton = document.createElement("span");
		deiconifyButton.className = "padding-1 margin-1 text-ultra-big nic";
		deiconifyButton.style.cursor = "pointer";
		deiconifyButton.appendChild(document.createTextNode(NaturalIconSetMap["maximize"]));
		exitButton = document.createElement("span");
		exitButton.className = "padding-1 margin-1 text-ultra-big text-color-red nic";
		exitButton.style.cursor = "pointer";
		exitButton.appendChild(document.createTextNode(NaturalIconSetMap["times"]));
	}
	var buttonArea = document.createElement("div"); // Area que contiene los botones
	buttonArea.className = "box";
	buttonArea.style.cssFloat = "right";
	buttonArea.appendChild(stackeableButton);
	buttonArea.appendChild(deiconifyButton);
	buttonArea.appendChild(exitButton);
	header.appendChild(buttonArea);
	var ttl = document.createElement("h2"); // Título de la ventana
	ttl.appendChild(document.createTextNode(title));
	header.appendChild(ttl);
	header.style.flex = "0 0 auto";
	content.style.flex = "1 1 auto";
	content.style.position = "relative";
	content.style.overflow = "auto";
	content.style.width = "100%";
	content.style.height = "100%";
	return function(window) // funcion que inicializa la ventana
	{
		window.className += "border border-round"; // la redondeamos un poco
		// Eventos:
		// Core (habilita la movilidad por el titulo)
		ttl.addEventListener("mousedown", function()
		{
			$(window).data("movable", "true");
			$(window).data("mousedown", "true");
		});
		ttl.addEventListener("mouseup", function()
		{
			$(window).data("movable", "false");
			$(window).data("mousedown", "false");
			window.style.cursor = "auto";
		});
		// Mover
		stackeableButton.addEventListener("click", function()
		{
			var mov = $(window).data("movable");
			if(mov == "true")
			{
				$(this).removeClass("border");
				$(window).data("movable", "false");
				NDesktopEmitEvent("fixeable", window, {});
			}
			else
			{
				$(this).addClass("border");
				$(window).data("movable", "true");
				NDesktopEmitEvent("stackeable", window, {});
			}
		});
		// Cerrar
		exitButton.addEventListener("click", function()
		{
			NDesktopEmitEvent("exit", window, {src: "exitButton"});
			$(window).remove();
		});
		// Maximizar/Desminimizar
		deiconifyButton.addEventListener("click", function()
		{
			var icon = $(window).data("iconified");
			if(icon == "false")
			{
				NDesktopEmitEvent("deiconify", window, {});
				//! Deiconify window
				//$(window).show();
				$(window).width(parseInt($(window).data("defaultWidth")));
				$(window).height(parseInt($(window).data("defaultHeight")));
				$(window).css({top: parseInt($(window).data("defaultTop")) + 59});
				$(window).css({left: parseInt($(window).data("defaultLeft"))});
				$(window).data("iconified", "true");
			}
			else
			{
				$(window).data("iconified", "false");
				NDesktopEmitEvent("maximized", window, {});
				// Maximize window
				window.style.top = $("#bar").height() + "px"; // System bar height
				window.style.left = "0px";
				window.style.width = "100%";
				window.style.height = ($("body").height() - $("#bar").height()) + "px";
			}
		});
		$(window).data("iconified", "true"); // Si esta minimizada
		window.appendChild(header); // Agregamos nuestro layout
		window.appendChild(content);
		window.style.display = "inline-flex";
		window.style.flexDirection = "column";
		window.style.resize = "both"; // la ventana debe ser Resizeable
		//window.style.overflow = "auto";
	};
}

// Crea un DOM en base a una lista de listas de listas...
// Cada cuarteto esta de la forma:
// [tagname, textcontent, classes, childrens]
// Donde todos son texto excepto childrens que es un arreglo:
// [child, child, child...]
// Y cada child es otro cuarteto.
function NDesktopMakeDOM(tri)
{
	var node = document.createElement(tri[0]);
	if(tri[1] != "")
	{
		var text = document.createTextNode(tri[1]);
		node.appendChild(text);
	}
	node.className = tri[2];
	var i = 0;
	var j = tri[3].length;
	for(i = 0; i < j; i++)
	{
		var c = tri[3][i];
		node.appendChild(NDesktopMakeDOM(c));
	}
	return node;
}

// Equivalente al superior, solo que desde una cadena.
// FIXME: A veces no funciona, no encuentro el error, por ello utilizo la
// incomoda funcion superior: NDesktopMakeDOM
function NDesktopDOMFromString(str)
{
	var parser = new DOMParser();
	var dom = parser.parseFromString(str, "text/xml");
	return dom.firstChild;
}

// Devuelve el Element en el cual se puede escribir el contenido de la
// Ventana.
function NDesktopGetBody(window)
{
	return $("#" + window.id + " > div.window-content").get(0);
}

// Cierra la ventana
function NDesktopCloseWindow(window)
{
	NDesktopEmitEvent("exit", window, {});
	$(window).remove();
}

// Agrega un manejador de eventos a la ventana
// El handler puede pedir un argumento: el evento
function NDesktopAddEventListener(window, eventname, handler)
{
	window.addEventListener(name, handler);
}

// Crea una aplicacion
function NDesktopMakeApplication(name, title, apphandler)
{
	NDesktopApplications.push({name: name, title: title, handler: apphandler});
}

// Abre una aplicacion
function NDesktopOpenApplication(name, args)
{
	var i = 0;
	var j = NDesktopApplications.length;
	for(i = 0; i < j; i++)
	{
		var capp = NDesktopApplications[i];
		if(capp.name == name)
		{
			return capp.handler(args);
		}
	}
	return null;
}

/* Definimos la Natural Minimal Graphical API (NMG API) */

// Crear una ventana
function NGraphCreateWindow(name, title)
{
	return NDesktopOpenWindow(name, title, NDesktopDefaultWindowLayout(title));
}

// Obtener su cuerpo (area donde puede ingresar sus porpios elementos)
function NGraphGetWindowBody(window)
{
	return NDesktopGetBody(window);
}

// Cerramos la ventana
function NGraphDestroyWindow(window)
{
	NDesktopCloseWindow(window);
}

// Agrega un manejador de eventos a la ventana
function NGraphWindowAddEventListener(window, eventname, handler)
{
	NDesktopAddEventListener(window, eventname, handler);
}

// Registra una applicacion
function NGraphCreateApplication(name, title, handler)
{
	NDesktopMakeApplication(name, title, handler);
}

// Abre una aplicacion
function NGraphOpenApplication(name, args)
{
	NDesktopOpenApplication(name, args);
}

// Guarda informacion en una ventana
function NGraphStoraDataInWindow(window, key, value)
{
	$(window).data(key, value);
}

// Recupera informacion de una venatan
function NGraphLoadDataFromWindow(window, key)
{
	return $(window).data(key);
}

/* Fin de la MNG API */

// Configuracion
NDesktopMakeApplication("config", "NConfig", function()
{
	var config = NDesktopOpenWindow("config", "Configuración", NDesktopDefaultWindowLayout("Configuración"));
	NDesktopGetBody(config).appendChild(NDesktopMakeDOM(
		["section", "", "container padding-16",
			[
				["p",
					"Bienvenido a la configuración de Natural Araguaney, " +
					"desde aquí, podrán configurar gran parte de las opciones" +
					" predeterminadas del cliente.",
					"margin-4", []],
				["p",
					"Le recomendamos que tenga cuidado al modificar estas opciones" +
					", recuerde que la ayuda esta disponible en la página oficial" +
					" de Natural Araguaney.",
					"margin-4", []],
				["p",
					"Este es NConfig v1.0.0",
					"margin-4",
					[]]
			]
	]));
	return true;
});

// Errores
NDesktopMakeApplication("splashScreen", "splashScreen", function()
{
	var splashScreen = NDesktopOpenWindow("splashScreen", "Esto esta mal", NDesktopDefaultWindowLayout("Esto esta mal"));
	splashScreen.classList.remove("color-white");
	splashScreen.classList.add("color-light-aqua");
	NDesktopGetBody(splashScreen).appendChild(NDesktopMakeDOM(
		["section", "", "container padding-16",
			[
				["span",
					":(",
					"margin-4 text-jumbo-5 text-color-white font-monospace container", []],
				["p",
					"Parece que algo ha salido mal en el sistema, le recomendamos cerrar la sesión y" +
					" reiniciar tanto el cliente como el servidor lo antes posible. No intente" +
					" seguir utilizando el sistema, esto puede corromper los datos y destruir la" +
					" instalación de Natural. Lamentamos las molestias ocasionadas." +
					" (¡No intente nada arriesgado!)",
					"margin-4 container", []],
				["address",
					"Atentamente, el equipo desarrollador de Natural",
					"margin-4 font-italic container",
					[]]
			]
	]));
	return true;
});

// Ayuda
NDesktopMakeApplication("help", "NHelp", function()
{
	var help = NDesktopOpenWindow("help", "Ayuda", NDesktopDefaultWindowLayout("Ayuda"));
	var dom = ["section", "", "container padding-16",
			[
				["p",
					"Bienvenido a Natural Araguaney (v1.0.0), la primera versión" +
					" de Natural. Natural es un sistema de control remoto" +
					" de sistemas embebidos: si, este programa realmente esta corriendo" +
					" en otro sistema (a menos que lo hayas iniciado manualmente en" +
					" tu sistema).",
					"margin-4", []],
				["p",
					"Si eres principiante te recomendamos leer el manual de usuario de" +
					" Natural, dado que NDesktop implementa mecanismos muy distintos a" +
					" otros manejadores de escritorio como Gnome 2, Gnome 3, Cinnamon" +
					" u otros.",
					"margin-4", []],
				["p",
					"En resumen: Utiliza el boton Hogar (esquina superior izquierda) para" +
					" acceder tanto a las aplicaciones más comúnes, como a las ventanas" +
					" abiertas. Cada ventana posee tres (4) botones superiores, de izquierda" +
					" a derecha son: stackear (habilita o deshabilita la capacidad de mover la ventana)" +
					", maximizar, minimizar y cerrar.",
					"margin-4", []],
				["p",
					"No olvides cerrar sesión despues de utilizar Natural, dejarla abierta puede" +
					" permitir importantes fallas de seguridad.",
					"margin-4", []],
				["p",
					"Este es Natural Araguaney v1.0.0 y esta aplicacion es NHelp",
					"margin-4", []]
			]
	];
	NDesktopGetBody(help).appendChild(NDesktopMakeDOM(dom));
	return true;
});

// Todas las applicaciones
NDesktopMakeApplication("apps", "NApps", function()
{
	var wapps = NDesktopOpenWindow("apps", "Aplicaciones instaladas", NDesktopDefaultWindowLayout("Aplicaciones instaladas"));
	var makeappIcon = function(openname, title, icon)
	{
		var el = document.createElement("div");
		el.className = "box padding-16 margin-16 border-round applogo";
		el.appendChild(document.createTextNode(title));
		$(el).data("openname", openname);
		el.addEventListener("click", function()
		{
			NDesktopOpenApplication($(this).data("openname"));
		});
		return el;
	};
	var dom = [
		"section", "", "container padding-16 width-block height-block", [
			["h3",
				"Applicaciones instaladas y cargadas",
				"text-ultra-big",
				[]],
			["p",
				"Explora y lanza aplicaciones de forma intuitiva y simple con el" +
				" manejador de aplicaciones de NDesktop: NApps",
				"border-vertical bs-2 border-color-dark-aqua margin-32 padding-16",
				[]],
			["div",
				"",
				"fcontainer wrap wrap-center justify-space-around direction-row applications_zone",
				[]]
		]
	];
	NDesktopGetBody(wapps).appendChild(NDesktopMakeDOM(dom));
	var i = 0;
	var j = NDesktopApplications.length;
	var appel = NDesktopGetBody(wapps).getElementsByTagName("div")[0];
	for(i = 0; i < j; i++)
	{
		var capp = NDesktopApplications[i];
		appel.appendChild(makeappIcon(capp.name, capp.title, ""));
	}
	return true;
});

// Buscar una aplicacion
NDesktopMakeApplication("findapps", "NAppFinder", function()
{
	var wapps = NDesktopOpenWindow("findapps", "Buscar una aplicacion", NDesktopDefaultWindowLayout("Buscar una aplicacion"));
	var body = NDesktopGetBody(wapps);
	var searchResultArea = document.createElement("div");
	searchResultArea.className = "fcontainer wrap wrap-center justify-space-around direction-row applications_zone";
	var searchText = document.createElement("input");
	searchText.type = "text";
	searchText.className = "input color-white padding-4 margin-8 border bs-2 border-color-black";
	var makeappIcon = function(openname, title, icon)
	{
		var el = document.createElement("div");
		el.className = "box padding-16 margin-16 border-round applogo";
		el.appendChild(document.createTextNode(title));
		$(el).data("openname", openname);
		el.addEventListener("click", function()
		{
			NDesktopOpenApplication($(this).data("openname"));
		});
		return el;
	};
	var search = function(regexp)
	{
		var i = 0;
		var j = NDesktopApplications.length;
		while(searchResultArea.firstChild)
		{
			searchResultArea.removeChild(searchResultArea.firstChild);
		}
		for(i = 0; i < j; i++)
		{
			var capp = NDesktopApplications[i];
			if((capp.name.indexOf(regexp) >= 0) || (capp.title.indexOf(regexp) >= 0))
				searchResultArea.appendChild(makeappIcon(capp.name, capp.title, ""));
		}
	};
	var dom = [
		"section", "", "container padding-16 width-block height-block", [
			["h3",
				"Buscar applicaciones instaladas y cargadas",
				"text-ultra-big",
				[]],
			["p",
				"¿No encuentras alguna aplicación que instalastes?" +
				" busca y explora rápidamente entre todas tus aplicaciones con el NAppFinder",
				"border-vertical bs-2 border-color-dark-aqua margin-32 padding-16",
				[]]
		]
	];
	searchText.addEventListener("input", function()
	{
		search(this.value);
	});
	body.appendChild(NDesktopMakeDOM(dom));
	body.getElementsByTagName("section")[0].appendChild(searchText);
	body.getElementsByTagName("section")[0].appendChild(searchResultArea);
	return true;
});

NaturalOnLoadevent = function()
{
	clearInterval(NDesktopErrorInterval);
	NaturalLoadPrograms(function(appname, manifest)
	{
		var apps = $("#appshow").get(0);
		var div = document.createElement("div");
		var text = document.createElement("span");
		text.appendChild(document.createTextNode(appname));
		div.className = "item";
		div.style.display = "inline-flex";
		div.style.width = "110px";
		div.style.height = "110px";
		text.style.margin = "auto";
		div.addEventListener("click", function()
		{
			NDesktopOpenApplication(manifest.appid);
			$("#appshow").slideUp("slow");
		});
		div.appendChild(text);
		apps.appendChild(div);
	}, function()
	{
		$(".loader").nHide();
	});
};

window.addEventListener("load", function() // Cuando el DOM carge
{
	$("#appmenu").nHide(); // Oculta el menu del sistema (al presionar el boton hogar se muestra)
	$("#appshow").nHide(); // Oculta el menu de aplicaciones (al presionar la tecla aplicaciones se muestra)
	// Del core
	// Debemos mostrar los errores
	NDesktopErrorInterval = setInterval(function()
	{
		if(NaturalError.length > 0)
		{
			$("#intro").css({zIndex: 0, position: "absolute"});
			NaturalError.splice(0, 1);
			NDesktopOpenApplication("splashScreen");
		}
	}, 1000);
	$("#home, #appmenu > .item").click(function()
	{
		$("#appmenu").nToggle("slow");
	});
	$("#apps_show").click(function()
	{
		$("#appshow").nToggle("slow");
	});
	$("#config, #cxtm_config").click(function() // Cuando se abra la ventana de configuración
	{
		NDesktopOpenApplication("config");
	});
	$("#help, #cxtm_help").click(function() // Cuando se abra la ventana de configuración
	{
		NDesktopOpenApplication("help");
	});
	$("#allapp").click(function() // Cuando se abra la ventana de Applicaciones
	{
		NDesktopOpenApplication("apps");
	});
	$("#open").click(function() // Cuando se abra la ventana de Buscar Applicaciones
	{
		NDesktopOpenApplication("findapps");
	});
	$("#cxtm_exit").click(function() // Cuando se cierre el meno de contexto desde el mismo
	{
		$("#contextmenu").nHide("slow");
	});
	$("#cxtm_select").click(function() // Habilitar la seleccion global de texto
	{
		document.body.style.userSelect = "all";
		document.body.style.mozUserSelect = "all";
		document.body.style.webkitUserSelect = "all";
		document.body.style.msUserSelect = "all";
	});
	$(document).contextmenu(function(ev) // Cuando se intente hacer click derecho.
	{
		$("#contextmenu").nToggle("slow");
		ev.preventDefault();
		return false;
	});
	$(document).keydown(function(ev)
	{
		var key = ev.keyCode || ev.which;
		// Common key shortcuts
		if((ev.altKey || ev.ctrlKey || ev.metaKey) && (key == 77)) // Ctrl|Alt|Meta+M
		{
			// Open home tab
			$("#appmenu").slideToggle("slow");
			ev.preventDefault();
		}
		if((ev.altKey || ev.ctrlKey || ev.metaKey) && (key == 78)) // Ctrl|Alt|Meta+N
		{
			// Open home tab
			$("#appmenu").slideToggle("slow");
			ev.preventDefault();
		}
		if((ev.altKey || ev.ctrlKey || ev.metaKey) && (key == 66)) // Ctrl|Alt|Meta+B
		{
			// Open home tab
			$("#appshow").slideToggle("slow");
			ev.preventDefault();
		}
		if((ev.altKey || ev.ctrlKey || ev.metaKey) && (key == 86)) // Ctrl|Alt|Meta+V
		{
			// Open (Show All Apps)
			NDesktopOpenApplication("apps");
			ev.preventDefault();
		}
	});
	console.log("loaded events");
	NaturalLoadNext();
});
