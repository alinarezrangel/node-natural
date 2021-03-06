/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Client core.
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

var NaturalSocket = io.connect(window.location.origin); // Socket hacia el servidor
var NaturalLoadingIndex = 1; // Indice de carga, nada más para actualizar la imagen y
// poseer registro del índice actual.
var NaturalToken = ""; // Token de seguridad
var NaturalError = []; // Errores al inicializar
var NaturalOnLoadevent = function(){}; // Para los manejadores de escritorio
var NaturalExports = {}; // Datos de un modulo o aplicacion despues de ser importado
var NaturalSocketEvents = []; // Los eventos para respuestas del socket,
// recuerda los resultados
var NaturalImportedMods = []; // Arreglo que contiene los modulos importados.
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

// Funcion de depuracion
function NaturalLog(msg)
{
	console.log(msg);
}
function NaturalLogErr(msg)
{
	console.error(msg);
}

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
			NaturalLogErr("Unexpected response at " + JSON.stringify(data));
	});
	NaturalSocket.on("error-response", function(data)
	{
		var task = data.task || "";
		var pid = data.pid || "";
		var ev = NaturalCallTaskfromQueue(task, pid, true);
		if(ev !== null)
			ev.handler(data, null);
		else
			NaturalLogErr("Unexpected error at " + JSON.stringify(data));
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
	NaturalAddTaskToQueue("import", pid, function(err, data)
	{
		if(err)
		{
			callback(err);
			return;
		}
		callback(null, data.response);
	});
	NaturalSocket.emit("import", {
		cwd: path,
		pid: pid,
		token: NaturalToken,
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
	NaturalAddTaskToQueue("ls", pid, function(err, data)
	{
		if(err)
		{
			callback(err);
			return;
		}
		callback(null, data.files);
	});
	NaturalSocket.emit("ls", {
		cwd: path,
		pid: pid,
		token: NaturalToken,
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
				scriptTag.src = "/filesystem/application?file=" + encodeURIComponent(file.filename) + "&token=" + encodeURIComponent(NaturalToken);
				scriptTag.addEventListener("load", function()
				{
					var manifest = JSON.parse(JSON.stringify(NaturalExports));
					NaturalLog("Loaded manifest from " + $(this).attr("src") + ": the appname is " + manifest.appname);
					each(manifest.appname, manifest);
				});
				document.body.appendChild(scriptTag);
			}
		}
		end();
	});
}

// Importa un archivo JS en el directorio actual de manera asincrona
function NaturalRequireJS(modname, path, onloaded)
{
	var i = 0;
	var j = NaturalImportedMods.length;
	for(i = 0; i < j; i++)
	{
		if(NaturalImportedMods[i] == modname)
		{
			onloaded(true);
			return;
		}
	}
	var scriptTag = document.createElement("script");
	scriptTag.src = "/filesystem/module?file=" + encodeURIComponent(path) + "&token=" + encodeURIComponent(NaturalToken);
	scriptTag.async = true;
	scriptTag.addEventListener("load", function()
	{
		onloaded(false);
	});
	document.body.appendChild(scriptTag);
	NaturalImportedMods.push(modname);
}

// Actualiza la imagen e incrementa el indice de carga
function NaturalLoadNext()
{
	$("#main_load").attr("src", "/images/misc/load-" + NaturalLoadingIndex + ".svg");
	NaturalLoadingIndex += 1;
	NaturalLog("Reached " + NaturalLoadingIndex);
	if(NaturalLoadingIndex >= 6)
	{
		NaturalLog("On loaded");
		NaturalOnLoaded();
	}
}

// Llama a una funcion de sockets con los datos especificados
function NaturalHighLevelSocketCall(task, pid, data, callback)
{
	data["pid"] = pid;
	data["token"] = NaturalToken;

	NaturalAddTaskToQueue(task, pid, callback);
	NaturalSocket.emit(task, data);
}

// Importa un **modulo** javascript de manera asincrona
function NaturalImportJS(pid, path, onloaded)
{
	if(path.charAt(path.length - 1) == "/")
		path = path.substr(0, path.length - 2);

	NaturalLog("Importing " + path + ":$NATURAL/" + path + "/natural.json");

	NaturalHighLevelSocketCall("api.file.readAll", pid, {
		"path": "$NATURAL/" + path + "/natural.json",
		"readAs": "stringUTF8"
	}, function(err, data)
	{
		NaturalLog("Loaded?");
		if(err)
		{
			NaturalLog("No " + err);
			return onloaded(err);
		}

		NaturalLog("Yes " + data.filecontent);
		var obj = JSON.parse(data.filecontent);

		if(obj.type !== "module")
		{
			NaturalLog("But isnt a module");
			return onloaded(
				new Error("NaturalImportJS Error: The imported resource is NOT a natural module")
			);
		}

		NaturalRequireJS(obj.name, path + "/" + obj.name + ".js", function(imported)
		{
			NaturalLog("Imported done");
			onloaded(null, imported);
		})
	})
}

NaturalSocket.on("ready", function(data) // Cuando el servidor pueda manejar nuestras solicitudes:
{
	NaturalLog("loaded socket");
	NaturalLoadNext();
	$.get("/token", {}, function(data, status, xhr) // Obtén el socket por AJAX
	{
		if((status == "success") && (data != "none"))
		{
			data = new DOMParser().parseFromString(data, "text/html").getElementsByTagName("token")[0].firstChild.nodeValue;
			NaturalToken = data;
			NaturalLog("Loaded data " + data);
			NaturalLoadNext();
			NaturalSocket.on("authenticated", function(data) // E intenta autenticar
			{
				var valid = data.valid || false;
				NaturalLog("Is valid: " + valid);
				if(valid)
				{
					NaturalLog("hello server?");
					NaturalSocket.emit("hello", {});
					NaturalSocket.on("world", function(data)
					{
						NaturalLoadNext();
						NaturalLog("Hello World");
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
			NaturalLogErr("error on get token " + data);
		}
	}, "text");
});

window.addEventListener("load", function() // Cuando el DOM carge
{
	NaturalLog("loaded DOM");
	NaturalLoadNext();
});
