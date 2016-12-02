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
		"applications": {
			"buttons": {
				"ready": "Listo"
			},
			"welcome": {
				"title": "Bienvenido a Pure",
				"description": "Todo lo que ves, desde las barras del menu hasta los estilos de esta ventana, es el resultado de un entorno de escritorio simple, intuitivo y elegante. Ya no más barras grandes y grises, adapta el sistema a tu experiencia única de usuario. Esto es Pure, puro y simple."
			}
		}
	},
	"en": {
		"closesession": "Close session",
		"loadingapps": "Loading Applications",
		"openappsmenu": "Applications",
		"seeappsmenu": "Windows",
		"applications": {
			"buttons": {
				"ready": "Ready"
			},
			"welcome": {
				"title": "Welcome to Pure",
				"description": "All of what you see, from the menu bars to this window's styles, is the result of a desktop environment simple, intuitive and elegant. No more big grey bars, adapt the system to you unique user experience. This is Pure, pure and simple."
			}
		}
	}
};

var NIntLocaleName = PureLanguage;
var NIntLocales = PureLanguages;
var NIntLocaleStrings = PureLocaleStrings;

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
