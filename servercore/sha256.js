/*
Biblioteca para cifrar y descifrar texto en SHA-256
*/

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
