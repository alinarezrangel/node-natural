/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** SHA256 crypto library.
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

var crypto = require("crypto");

// Contraseña para generar los tokens
var password = "dDfnDn5gn4";

/*
Creo que el nombre es bastante semántico: encripta un texto con SHA256.
Utiliza la variable global password
*/
function SHA256crypt(text)
{
	var cipher = crypto.createCipher("aes-256-ctr", password);
	var crypted = cipher.update(text, "utf8", "hex");
	crypted += cipher.final("hex");
	return crypted;
}

/*
Creo que el nombre es bastante semántico: desencripta un texto con SHA256.
Utiliza la variable global password
*/
function SHA256decrypt(text)
{
	var decipher = crypto.createDecipher("aes-256-ctr", password);
	var dec = decipher.update(text, "hex", "utf8");
	dec += decipher.final("utf8");
	return dec;
}

/*
Cambia u obtiene la contraseña a lo JQuery:
ChangeOrGetPassword() => Devuelve la contraseña
ChangeOrGetPassword("anithing") => fija la contraseña
*/
function ChangeOrGetPassword(passwd)
{
	if(typeof passwd === "string")
	{
		password = passwd;
	}
	else
	{
		return password;
	}
}

module.exports = {
	Crypt: SHA256crypt,
	Decrypt: SHA256decrypt,
	ChangeOrGetPassword: ChangeOrGetPassword
};
