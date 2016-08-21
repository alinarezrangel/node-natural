/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Client core.
***********************************
****************************************************************** */

var NaturalSocket = io.connect(window.location.origin); // Socket hacia el servidor
var NaturalLoadingIndex = 1; // Indice de carga, nada más para actualizar la imagen y
// poseer registro del índice actual.
var NaturalToken = ""; // Token de seguridad
var NaturalError = []; // Errores al inicializar
var NaturalOnLoadevent = function(){}; // Para los manejadores de escritorio
var NaturalExports = {}; // Datos de un modulo o aplicacion despues de ser importado
var NaturalSocketEvents = []; // Los eventos para respuestas del socket,
// recuerda que los resultados
// Mapa clave-valor para el NaturalIconSet
var NaturalIconSetMap = {
	"bars": "a",
	"openquote": "b",
	"closequote": "c",
	"dir": "d",
	"times": "e",
	"iconify": "f",
	"deiconify": "g",
	"cube": "h",
	"dash": "i",
	"minus": "j",
	"plus": "k",
	"maximize": "l",
	"bareright": "m",
	"bareleft": "n",
	"baretop": "ñ",
	"barebottom": "o",
	"alert-triangle": "p",
	"load-3-4": "q",
	"load-2-4": "r",
	"load-1-4": "s",
	"loadboard-dotted": "t",
	"loadboard-arrowed": "u",
	"loadboard-dotted-up": "v",
	"loadboard-arrowed-up": "w",
	"stackeable": "x",
	"stackeable-up": "y",
	"stackeable-down": "z",
	"natural-logicon": "A",
	"natural-syslog": "B",
	"natural-logicon-up": "C",
	"natural-syslog-up": "D",
	"star": "E",
	"git": "F",
	"picture": "G",
	"message": "H",
	"message-dotted": "I",
	"messages": "J",
	"loadboard": "K",
	"pencil": "L",
	"writing": "M",
	"joining": "N",
	"book": "Ñ",
	"spliting": "O",
	"expand": "P",
	"contract": "Q",
	"dots-void-h": "R",
	"dots-void-v": "S",
	"dots-h": "T",
	"dots-v": "U",
	"triangle-right": "V",
	"double-bars-v": "W",
	"rectangle": "X",
	"circle": "Y",
	"pentagon": "Z",
	"eye": "0",
	"deny": "1",
	"info": "2",
	"unchecked-box": "3",
	"checked-box": "4",
	"gear-void": "5",
	"gear": "6",
	"infocircle": "7",
	"trash": "8",
	"trash-mini": "9",
	"book-mini": "."
};

// Se llama cuando ya se cargo el sistema por completo.
function NaturalOnLoaded()
{
	$("#intro").fadeOut();
	NaturalSocket.on("response", function(data)
	{
		var task = data.task || "";
		var pid = data.pid || "";
		var ev = NaturalCallTaskfromQueue(task, pid, true);
		if(ev !== null)
			ev.handler(null, data);
		else
			console.log("Unexpected response at " + JSON.stringify(data));
	});
	NaturalSocket.on("error-response", function(data)
	{
		var task = data.task || "";
		var pid = data.pid || "";
		var ev = NaturalCallTaskfromQueue(task, pid, true);
		if(ev !== null)
			ev.handler(data, null);
		else
			console.error("Unexpected error at " + JSON.stringify(data));
	});
	NaturalOnLoadevent();
}

// Agrega un evento a la cola de eventos.
// Las comunicaciones con el servidor utilizan los mismo canales, y para
// distiguir entre una respuesta y otra es necesario utilizar PIDs y tasknames
function NaturalAddTaskToQueue(taskname, pid, callback)
{
	NaturalSocketEvents.push({task: taskname, pid: pid, handler: callback});
}

// Borra un elemento de la cola de eventos
function NaturalRemoveTaskfromQueue(taskname, pid)
{
	var i = 0;
	var j = NaturalSocketEvents.length;
	for(i = (j - 1); i >= 0; i--)
	{
		var cev = NaturalSocketEvents[i];
		if((cev.task == taskname) && (cev.pid == pid))
		{
			NaturalSocketEvents.splice(i, 1);
			return true;
		}
	}
	return false;
}

// Llama a un elemento de la pila de eventos
// Lo borra si del es true
function NaturalCallTaskfromQueue(taskname, pid, del)
{
	var i = 0;
	var j = NaturalSocketEvents.length;
	for(i = (j - 1); i >= 0; i--)
	{
		var cev = NaturalSocketEvents[i];
		if((cev.task == taskname) && (cev.pid == pid))
		{
			if(del)
				return NaturalSocketEvents.splice(i, 1)[0];
			else
				return cev;
		}
	}
	return null;
}

// Importa algun recurso del sistema, esta funcion es para importar recursos del filesystem
// Llama al callback con dos argumentos: el error (si hay) y el contenido del archivo. Es asincrono
// para evitar bloqueos por archivos grandes
// path es de la forma:
//  /ruta/absoluta/a/algo
// pid es el Process ID del programa en el lado cliente.
// SOLO FUNCIONA PARA ARCHIVOS DE TEXTO
function NaturalImport(path, pid, callback)
{
	if(path.length == 0)
	{
		callback(new Error("The path is null"));
		return;
	}
	/*
	if(path.charAt(0) != "/")
	{
		callback(new Error("the path is not absolute"));
		return;
	}
	*/
	NaturalSocket.emit("import", {
		cwd: path,
		pid: pid,
		token: NaturalToken,
	});
	NaturalAddTaskToQueue("import", pid, function(err, data)
	{
		if(err)
		{
			callback(err);
			return;
		}
		callback(null, data.response);
	});
}

// Lee todos los archivos y directorios en una ruta especifica (ls o dir)
// Callback es de la forma:
//     callback(err, files => array)
function NaturalListDir(path, pid, callback)
{
	if(path.length == 0)
	{
		callback(new Error("The path is null"));
		return;
	}
	/*
	if(path.charAt(0) != "/")
	{
		callback(new Error("the path is not absolute"));
		return;
	}
	*/
	NaturalSocket.emit("ls", {
		cwd: path,
		pid: pid,
		token: NaturalToken,
	});
	NaturalAddTaskToQueue("ls", pid, function(err, data)
	{
		if(err)
		{
			callback(err);
			return;
		}
		callback(null, data.files);
	});
}

// Carga los programas ubicados en natural/bin/
// Por cada programa cargado, llama a each(program name, manifest)
function NaturalLoadPrograms(each, end)
{
	NaturalListDir("$NATURAL/bin/", 0, function(err, files)
	{
		if(err)
		{
			NaturalError.push("loadprograms");
			console.error(err);
			return;
		}
		var i = 0;
		var j = files.length;
		for(i = 0; i < j; i++)
		{
			var file = files[i];
			if(!file.isDirectory)
			{
				var scriptTag = document.createElement("script");
				scriptTag.src = "/filesystem/application?file=" + encodeURI(file.filename);
				scriptTag.addEventListener("load", function()
				{
					var manifest = JSON.parse(JSON.stringify(NaturalExports));
					console.log("Loaded manifest from " + $(this).attr("src") + ": the appname is " + manifest.appname);
					each(manifest.appname, manifest);
				});
				document.body.appendChild(scriptTag);
			}
		}
		end();
	});
}

// Actualiza la imagen e incrementa el indice de carga
function NaturalLoadNext()
{
	$("#main_load").attr("src", "/images/misc/load-" + NaturalLoadingIndex + ".svg");
	NaturalLoadingIndex += 1;
	if(NaturalLoadingIndex >= 6)
	{
		NaturalOnLoaded();
	}
}

NaturalSocket.on("ready", function(data) // Cuando el servidor pueda manejar nuestras solicitudes:
{
	console.log("loaded socket");
	NaturalLoadNext();
	$.get("/token", {}, function(data, status, xhr) // Obtén el socket por AJAX
	{
		if((status == "success") && (data != "none"))
		{
			NaturalToken = data;
			NaturalLoadNext();
			NaturalSocket.on("authenticated", function(data) // E intenta autenticar
			{
				var valid = data.valid || false;
				console.log("Is valid: " + valid);
				if(valid)
				{
					console.log("hello server?");
					NaturalSocket.emit("hello", {});
					NaturalSocket.on("world", function(data)
					{
						NaturalLoadNext();
						console.log("Hello World");
					});
				}
				else
				{
					NaturalError.push("authentication");
				}
			});
			NaturalSocket.emit("authenticate", {token: NaturalToken});
		}
		else
		{
			console.log("error on get token " + data);
		}
	}, "text");
});

window.addEventListener("load", function() // Cuando el DOM carge
{
	console.log("loaded DOM");
	NaturalLoadNext();
});
