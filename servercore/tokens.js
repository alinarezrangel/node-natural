/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Handles JSON tokens.
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

var sha256 = require("./sha256");

var validTokens = []; // Tokens válidos
// Valores min y max del número aleatorio del token.
var R = {
	"a": 0,
	"b": 900000
};

/*
Ajusta value para que posee un tamaño igual a n. Rellena lo faltante
con el caracter r y borra lo sobrante. Cuando borra, selecciona desde el
inicio.
*/
function AdjustToN(value, n, r)
{
	while(value.length < n)
	{
		value = r + value;
	}
	if(value.length > n)
	{
		value = value.substr(0, n);
	}
	return value;
}

/*
Crea un nuevo token para el usuario id.
*/
function MakeNewtoken(id)
{
	var st = Math.round(Math.random() * (R.b - R.a)) + R.a;
	var et = Math.round(Math.random() * (R.b - R.a)) + R.a;
	var sid = id.toString();
	var timestamp = Date.now();
	sid = AdjustToN(sid, 40, " ");
	st = AdjustToN(st + "", 5, "0");
	et = AdjustToN(et + "", 5, "0");
	timestamp = AdjustToN(timestamp + "", 15, "0");
	//console.log("Maked " + st + "" + sid + "" + et);
	return sha256.Crypt(timestamp + "" + st + "" + sid + "" + et);
}

/*
Extrae el nombre de usuario desde un token
*/
function GetUserFromToken(token)
{
	var decrypted = sha256.Decrypt(token);
	// El token es:
	// tttttttttttttttsssssuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuueeeee
	// Donde: t = timestamp
	// s = Start random number
	// u = username
	// e = End random number
	var username = decrypted.substr(20, 40);
	//console.log("Decrypted " + username.trim());
	return username.trim();
}

/*
Devuelve el token del usuario.
*/
function GetTokenFromUser(username)
{
	var i = 0;
	var j = validTokens.length;
	//console.log(validTokens);
	for(i = 0; i < j; i++)
	{
		//console.log("at " + i + ": " + validTokens[i] + "; " + SHA256decrypt(validTokens[i]));
		var decr = GetUserFromToken(validTokens[i]);
		if(decr == username)
		{
			//console.log("successful");
			return validTokens[i];
		}
	}
	return null;
}

/*
Valida un token.
*/
function ValidateToken(token)
{
	//console.log("validating " + token + " is:");
	//console.log(validTokens.indexOf(token) >= 0);
	return validTokens.indexOf(token) >= 0;
}

/*
Agrega un nuevo token a la lista
*/
function PushNewToken(token)
{
	validTokens.push(token);
}

/*
Borra un token de la lista
*/
function DeleteToken(token)
{
	var index = validTokens.indexOf(token);
	if(index < 0)
	{
		console.error("Invalid token [" + token + "] for destroy, EIGNORED");
		return;
	}
	validTokens.splice(index, 1);
}

module.exports = {
	MakeNewtoken: MakeNewtoken,
	GetUserFromToken: GetUserFromToken,
	GetTokenFromUser: GetTokenFromUser,
	ValidateToken: ValidateToken,
	PushNewToken: PushNewToken,
	DeleteToken: DeleteToken
};
