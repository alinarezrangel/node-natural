/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Server core.
***********************************
****************************************************************** */

var express = require("express");
var app = express();
var http = require("http");
var server = http.Server(app);
var socketio = require("socket.io");
var io = socketio(server);
var passwd = require("passwd-linux");
var bodyParser = require("body-parser");
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var fs = require("fs");
var crypto = require("crypto");

var natural = __dirname + "/natural"; // Directorio con los datos de la instalacion.
// Actualmente no hay nada, pero se reserva por motivos semánticos y de compatibilidad:
// antes (Natural v0.0.1) se validaban los usuarios con el archivo /natural/shadow
// en vez de /etc/shadow, pero luego fue eliminado a favor del modulo passwd-linux

var validTokens = []; // Tokens válidos
// Valores min y max del número aleatorio del token.
var R = {
	"a": 0,
	"b": 90000
};
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
	sid = AdjustToN(sid, 40, " ");
	st = AdjustToN(st + "", 5, "0");
	et = AdjustToN(et + "", 5, "0");
	//console.log("Maked " + st + "" + sid + "" + et);
	return SHA256crypt(st + "" + sid + "" + et);
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
		var decr = SHA256decrypt(validTokens[i]).substr(5, 40);
		if(decr.trim() == username)
		{
			return validTokens[i];
		}
	}
	return null;
}

/*
Valida un token.
*/
function validate(token)
{
	return validTokens.indexOf(token) > 0;
}

/*
Inicializa la API de socket.
*/
function initSocket(socket)
{
	socket.on("hello", function(data)
	{
		socket.emit("world", {});
	});
}

app.use(bodyParser.urlencoded({extended: true})); // POST data
app.use(express.static("public")); // directorio estatico
app.use(session({
	store: new FileStore({
		path: __dirname + "/sessions",
		ttl: 3600, // aprox. 10 hours
		retries: 5,
		factor: 1,
		minTimeout: 50,
		maxTimeout: 150,
		reapInterval: 360, // aprox. 1 hour
		encrypt: true
	}),
	secret: "secret hash",
	httpOnly: true,
	resave: false,
	saveUninitialized: false
}));
app.use(function(req, res, next) // CSP headers
{
	res.setHeader("Strict-Transport-Security", "max-age=31536000 ; includeSubDomains");
	res.setHeader("X-XSS-Protection", "0");
	res.setHeader("X-Frame-Options", "deny");
	res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; connect-src 'self' ws://localhost:4567/ wss://localhost:4567/");
	return next();
});

server.listen(4567); // Puerto predeterminado, se puede cambiar si también cambia el puerto
// en el cliente.

app.get("/", function(req, res)
{
	res.redirect("/index.html");
});

app.get("/login", function(req, res)
{
	// login es solo accesible para methods POST
	res.redirect("/");
});

app.get("/logout", function(req, res) // Destruye la sesión
{
	req.session.destroy(function(err)
	{
		if(err)
		{
			console.error(err);
		}
		res.redirect("/");
	});
});

app.get("/main", function(req, res)
{
	if(req.session.logged)
	{
		res.sendFile(__dirname + "/private/desktop.html");
	}
	else
	{
		res.redirect("/");
	}
});

app.post("/login", function(req, res)
{
	var post = req.body;
	var username = post.username.toString() || "";
	var password = post.password.toString() || "";
	passwd.checkUser(username, function(error, us) // Si el usuario existe
	{
		if(error)
		{
			console.error(error);
			res.redirect("/?error=enouser");
			return;
		}
		if(us != "userExist")
		{
			console.error(new Error("The user not exist"));
			res.redirect("/?error=enouser");
			return;
		}
		passwd.checkPass(username, password, function(error, rs) // Y la contraseña es correcta
		{
			if(error)
			{
				console.error(error);
				res.redirect("/?error=enopass");
				return;
			}
			if(rs != "passwordCorrect")
			{
				console.error(new Error("The user password not match"));
				res.redirect("/?error=enopass");
				return;
			}
			// Inicializa la sesion:
			// logged: si la sesión es válida y esta ingresada.
			req.session.logged = true;
			// tokenized: si ya se le otorgo un token de seguridad.
			req.session.tokenized = false;
			// username: nombre del usuario.
			req.session.username = username;
			//console.log(validTokens);
			validTokens.push(MakeNewtoken(username));
			//console.log(validTokens);
			res.redirect("/main");
		});
	});
});

app.get("/token", function(req, res) // Devuelve el token de seguridad, sideñado para consultas AJAX
{
	//console.log("requested token");
	// Lo devuelve solo si: se inicio sesión, y esta es válida, y no se ha entregado un token a este
	// usuario antes.
	if((req.session) && (req.session.logged) && (!req.session.tokenized))
	{
		//console.log("gived " + GetTokenFromUser(req.session.username));
		res.send(GetTokenFromUser(req.session.username));
		req.session.tokenized = true;
	}
	else
	{
		res.send("none");
	}
});

app.get("/private/:resource", function(req, res) // Acceso a recursos privados.
{
	if(req.session.logged)
	{
		res.sendFile(__dirname + "/private/" + req.params.resource);
	}
	else
	{
		res.redirect("/");
	}
});

io.on("connection", function(socket) // Sistema de autenticación de sockets.
{
	var token = "";
	socket.emit("ready", {});
	socket.on("authenticate", function(data)
	{
		var token = data.token || "";
		if(validTokens.indexOf(token) < 0)
		{
			socket.emit("authenticated", {valid: false});
		}
		else
		{
			socket.emit("authenticated", {valid: true});
			initSocket(socket);
		}
	});
});
