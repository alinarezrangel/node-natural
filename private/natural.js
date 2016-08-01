/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Client core.
***********************************
****************************************************************** */

var NaturalSocket = io.connect("http://localhost:4567"); // Socket hacia el servidor
var NaturalLoadingIndex = 1; // Indice de carga, nada más para actualizar la imagen y
// poseer registro del índice actual.
var NaturalToken = ""; // Token de seguridad

// Se llama cuando ya se cargo el sistema por completo.
function NaturalOnLoaded()
{
	$("#intro").fadeOut();
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
