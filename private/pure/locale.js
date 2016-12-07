/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Pure Desktop Environment Locale Library.
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

var PureLanguage = "es";
var PureLanguages = [
	{
		"code": "es",
		"name": "español"
	},
	{
		"code": "en",
		"name": "english"
	}
];

var PureLocaleStrings = {
	"es": {
		"closesession": "Cerrar sesión",
		"loadingapps": "Cargando aplicaciones",
		"openappsmenu": "Aplicaciones",
		"seeappsmenu": "Ventanas",
		"logoutmessage": "¿Estas seguro que deseas cerrar sesión?",
		"logoutmessage_yes": "Si (cerrar sesión)",
		"logoutmessage_no": "No (continuar en Natural)",
		"volumemenu": "Volumen",
		"applications": {
			"buttons": {
				"ready": "Listo"
			},
			"welcome": {
				"title": "Bienvenido a Pure",
				"description": "Todo lo que ves, desde las barras del menu hasta los estilos de esta ventana, es el resultado de un entorno de escritorio simple, intuitivo y elegante. Ya no más barras grandes y grises, adapta el sistema a tu experiencia única de usuario. Esto es Pure, puro y simple."
			},
			"desktopconfig": {
				"title": "Configuración del escritorio",
				"globalanimationduration": "Duración de la animación global:",
				"soundtheme": "Tema de sonido:",
				"language": "Idioma (requiere reiniciar y privilegios):"
			},
			"sounds": {
				"title": "Audio del sistema",
				"mutedlabel": "Sonidos omitidos",
				"volume": "Volumen",
				"mute": "Sin audio"
			},
			"background": {
				"title": "Fondo de escritorio",
				"current": "Ruta al fondo de escritorio:",
				"select": "Ingrese el tipo de fondo:",
				"update": "Actualizar",
				"cb_cover": "Cubrir toda la pantalla",
				"cb_contains": "Ver el fondo completo",
				"cb_fills": "Rellenar repitiendo el fondo"
			}
		}
	},
	"en": {
		"closesession": "Close session",
		"loadingapps": "Loading Applications",
		"openappsmenu": "Applications",
		"seeappsmenu": "Windows",
		"logoutmessage": "Are you sure of log out?",
		"logoutmessage_yes": "Yes (and log out)",
		"logoutmessage_no": "No (continue in Natural)",
		"volumemenu": "Volume",
		"applications": {
			"buttons": {
				"ready": "Ready"
			},
			"welcome": {
				"title": "Welcome to Pure",
				"description": "All of what you see, from the menu bars to this window's styles, is the result of a desktop environment simple, intuitive and elegant. No more big grey bars, adapt the system to you unique user experience. This is Pure, pure and simple."
			},
			"desktopconfig": {
				"title": "Desktop configuration",
				"globalanimationduration": "Global animation duration:",
				"soundtheme": "Sound theme:",
				"language": "Language (requires restart and privileges):"
			},
			"sounds": {
				"title": "System audio",
				"mutedlabel": "Muted sounds",
				"volume": "Volumen",
				"mute": "Muted"
			},
			"background": {
				"title": "Desktop background",
				"current": "Path to the desktop background:",
				"select": "Select the background type:",
				"update": "Update",
				"cb_cover": "Cover all the screen",
				"cb_contains": "See the complete background",
				"cb_fills": "Fills the screen repeating the image"
			}
		}
	}
};

// Natural Universal International API (NInt)

var NIntLocaleName = PureLanguage;
var NIntLocales = PureLanguages;
var NIntLocaleStrings = PureLocaleStrings;

// End

function PureInitInternational(fcn)
{
	NaturalHighLevelSocketCall("api.locale.get", 0, {}, function(err, data)
	{
		if(err)
		{
			console.log("Error getting locale " + err);
			return;
		}
		PureLanguage = NIntLocaleName = data.locale;
		fcn();
	});
}
