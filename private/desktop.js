/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Default desktop event manager.
***********************************
****************************************************************** */

var NDesktopGWID = 0;

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
	+ `quit`: Cuando se cierra la ventana
	+ `opened`: Cuando se abre la ventana
	*/
	var wind = document.createElement("div");
	wind.className = "window color-white no-margin no-padding overflow-auto";
	wind.style.width = "300px";
	wind.style.height = "300px";
	wind.style.position = "absolute";
	wind.id = "window_" + name + "_" + NDesktopGWID;
	NDesktopGWID += 1; // GWID es para evitar el problema del JOS.
	contenthtml(wind); // contenthtml debe ser una funcion
	document.getElementById("main").appendChild(wind);
	$(wind).data("mousedown", "false");
	$(wind).data("movable", "true");
	wind.addEventListener("mousedown", function()
	{
		if($(this).data("movable") == "true")
		{
			this.style.zindex = 5;
			document.body.style.userSelect = "none";
			document.body.style.mozUserSelect = "none";
			document.body.style.webkitUserSelect = "none";
			document.body.style.msUserSelect = "none";
			$(this).data("mousedown", "true");
		}
	});
	wind.addEventListener("mouseup", function()
	{
		if($(this).data("movable") == "true")
		{
			this.style.zindex = 2;
			document.body.style.userSelect = "all";
			document.body.style.mozUserSelect = "all";
			document.body.style.webkitUserSelect = "all";
			document.body.style.msUserSelect = "all";
			$(this).data("mousedown", "false");
		}
	});
	wind.addEventListener("mousemove", function(ev)
	{
		if(($(this).data("mousedown") == "true") && ($(this).data("movable") == "true"))
		{
			this.style.top = (ev.clientY - ($(this).height() / 2)) + "px";
			this.style.left = (ev.clientX - ($(this).width() / 2)) + "px";
		}
	}, false);
	return wind;
}

function NDesktopEmitEvent(name, target, data) // Emite un evento personalizado a target, data será pasado como
{ // sus atributos: data = {hola: "mundo"} entonces target.on(name, function(ev){ev.hola == "mundo"})
	var ev = new CustomEvent(name, data);
	return target.dispatchEvent(ev);
}

function NDesktopDefaultWindowLayout(title) // Crea un layout predeterminado
{
	var header = document.createElement("header"); // Barra superior
	header.className = "container padding-16 no-margin color-dark-grey window-heading";
	var content = document.createElement("div"); // Contenido
	content.className = "container padding-4 no-margin window-content";
	var stackeableButton = document.createElement("img"); // Boton para mover la ventana
	stackeableButton.className = "padding-1 margin-1 color-dark-grey border";
	stackeableButton.width = 25;
	stackeableButton.height = 25;
	stackeableButton.src = "/images/misc/stackeableButton.svg";
	stackeableButton.style.marginRight = 30;
	var deiconifyButton = document.createElement("img"); // Boton para maximizar o desminimizar
	deiconifyButton.className = "padding-1 margin-1 color-dark-grey";
	deiconifyButton.width = 25;
	deiconifyButton.height = 25;
	deiconifyButton.src = "/images/misc/deiconifyButton.svg";
	deiconifyButton.style.marginRight = 30;
	var exitButton = document.createElement("img"); // Boton para cerrar la ventana
	exitButton.className = "padding-1 margin-1 color-dark-grey";
	exitButton.width = 25;
	exitButton.height = 25;
	exitButton.src = "/images/misc/exitButton.svg";
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
	return function(window) // funcion que inicializa la ventana
	{
		window.className += "border border-round"; // la redondeamos un poco
		// Eventos:
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
			if(icon == "true")
			{
				NDesktopEmitEvent("deiconify", window, {});
				// Deiconify window
				$(window).show();
			}
			else
			{
				NDesktopEmitEvent("maximized", window, {});
				// Maximize window
				window.style.top = $("#bar").height() + "px"; // System bar height
				window.style.left = "0px";
				window.style.width = "100%";
				window.style.height = ($("body").height() - $("#bar").height()) + "px";
			}
		});
		$(window).data("iconified", "false"); // Si esta minimizada
		window.appendChild(header); // Agregamos nuestro layout
		window.appendChild(content);
		window.style.overflow = "auto"; // Para evitar que el texto se muestre afuera de la ventana
		window.style.resize = "both"; // la ventana debe ser Resizeable
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
	return dom;
}

// Devuelve el Element en el cual se puede escribir el contenido de la
// Ventana.
function NDesktopGetBody(window)
{
	return $("#" + window.id + " > div.window-content").get(0);
}

window.addEventListener("load", function() // Cuando el DOM carge
{
	$("#appmenu").hide(); // Oculta el menu del sistema (al presionar el boton hogar se muestra)
	$("#home, #appmenu > .item").click(function()
	{
		$("#appmenu").slideToggle("slow");
	});
	$("#config, #cxtm_config").click(function() // Cuando se abra la ventana de configuración
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
						"margin-4", []]
				]
		]));
	});
	$("#help, #cxtm_help").click(function() // Cuando se abra la ventana de configuración
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
						"Este es Natural Araguaney v1.0.0",
						"margin-4", []]
				]
		];
		NDesktopGetBody(help).appendChild(NDesktopMakeDOM(dom));
	});
	$(document).contextmenu(function() // Cuando se intente hacer click derecho.
	{
		$("#contextmenu").fadeToggle("slow");
		return false;
	});
	$("#cxtm_exit").click(function() // Cuando se cierre el meno de contexto desde el mismo
	{
		$("#contextmenu").fadeOut("slow");
	});
	$("#cxtm_select").click(function() // Habilitar la seleccion global de texto
	{
		document.body.style.userSelect = "all";
		document.body.style.mozUserSelect = "all";
		document.body.style.webkitUserSelect = "all";
		document.body.style.msUserSelect = "all";
	});
	console.log("loaded events");
	NaturalLoadNext();
});
