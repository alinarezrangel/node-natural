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
var child_proccess = require("child_process");
//var userid = require("userid");
var ip = require("ip");

var natural = __dirname + "/natural"; // Directorio con los datos de la instalacion y configuración.

var configuration = JSON.parse(fs.readFileSync(natural + "/config.json", "utf8"));

var validTokens = []; // Tokens válidos
// Valores min y max del número aleatorio del token.
var R = {
	"a": 0,
	"b": 900000
};
// Contraseña para generar los tokens
var password = "dDfnDn5gn4";

/*
Devuelve el nombre de usuario del userid especificado.
Para ello el lee /etc/passwd
*/
function GetUsernameFromUserID(userid)
{
	var etcpasswd = fs.readFileSync("/etc/passwd", "utf8");
	var lines = etcpasswd.split("\n");
	var i = 0;
	var j = 0;
	var s1 = lines.length;
	for(i = 0; i < s1; i++)
	{
		var line = lines[i].split(":");
		if(line[2] == userid)
		{
			return line[0];
		}
	}
	return "";
}

/*
Devuelve el nombre de un grupo en base a su groupid
*/
function GetGroupnameFromGroupID(groupid)
{
	var etcgroup = fs.readFileSync("/etc/group", "utf8");
	var lines = etcgroup.split("\n");
	var i = 0;
	var j = 0;
	var s1 = lines.length;
	for(i = 0; i < s1; i++)
	{
		var line = lines[i].split(":");
		if(line[2] == groupid)
		{
			return line[0];
		}
	}
	return "";
}

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
	var timestamp = Date.now();
	sid = AdjustToN(sid, 40, " ");
	st = AdjustToN(st + "", 5, "0");
	et = AdjustToN(et + "", 5, "0");
	timestamp = AdjustToN(timestamp + "", 15, "0");
	//console.log("Maked " + st + "" + sid + "" + et);
	return SHA256crypt(timestamp + "" + st + "" + sid + "" + et);
}

/*
Extrae el nombre de usuario desde un token
*/
function GetUserFromToken(token)
{
	var decrypted = SHA256decrypt(token);
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
Determina si el usuario user esta en el grupo group.
callback es de la forma (err, bool is_in_group) => void
*/
function IsUserInGroup(user, group, callback)
{
	fs.readFile("/etc/group", "utf8", function(err, data)
	{
		if(err)
		{
			console.error(err);
			callback(err);
			return;
		}
		var lines = data.split("\n");
		var i = 0;
		var j = lines.length;
		for(i = 0; i < j; i++)
		{
			var line = lines[i];
			var fl = line.split(":");
			var groupname = fl[0];
			if(groupname == group)
			{
				var users = fl[3].split(",");
				var w = 0;
				var t = users.length;
				for(w = 0; w < t; w++)
				{
					var cuser = users[w];
					if(cuser == user)
					{
						callback(null, true); // Se encontro el usuario y si esta en el grupo
						return;
					}
				}
				callback(null, false); // Se encontro el grupo, pero el usuario no estaba alli
				return;
			}
		}
		callback(null, false); // No se encontro el grupo
	});
}

/*
Determina si el usuario username puede realizar la accion d en el directorio o archivo dirorfile.
callback es de la forma (err, bool the_user_can) => void
*/
function UserCan(d, username, dirorfile, callback)
{
	var useregex = /^[a-z][a-zA-Z0-9_\-]*$/g;
	username = username.toString() + "";
	if(username.match(useregex) == null)
	{
		callback(new Error("The user not match the uregex"));
		return false;
	}
	var dirgroup = fs.stat(dirorfile, function(err, stats)
	{
		if(err)
		{
			console.error(err);
			callback(err);
			return;
		}
		d = 0 + d;
		var ownerCan = stats["mode"] & (d * 100);
		var groupCan = stats["mode"] & (d * 10);
		var othersCan = stats["mode"] & d;
		var gid = stats["gid"];
		var uid = stats["uid"];
		if(othersCan)
		{
			callback(null, true);
			return;
		}
		if(username == GetUsernameFromUserID(uid))
		{
			// I am the owner
			callback(null, true);
			return;
		}
		IsUserInGroup(username, GetGroupnameFromGroupID(gid), function(err, isin)
		{
			if(err)
			{
				console.error(err);
				callback(err);
				return;
			}
			callback(null, isin);
		})
	});
}

/*
Determina si el usuario puede leer un archivo o directorio.
Equivalente a UseCan(4, username, dirorfile, callback)
*/
function UserCanRead(username, dirorfile, callback)
{
	UserCan(4, username, dirorfile, callback)
}

/*
Determina si el usuario puede escribir en un archivo o directorio.
Equivalente a UseCan(2, username, dirorfile, callback)
*/
function UserCanWrite(username, dirorfile, callback)
{
	UserCan(2, username, dirorfile, callback)
}

/*
Determina si el usuario puede ejecutar un archivo o directorio.
Equivalente a UseCan(1, username, dirorfile, callback)
*/
function UserCanExec(username, dirorfile, callback)
{
	UserCan(1, username, dirorfile, callback)
}

/*
Inicializa la API de socket.
*/
function initSocket(socket, token)
{
	socket.on("hello", function(data)
	{
		//console.log("On hello");
		socket.emit("world", {});
	});
	socket.on("import", function(data)
	{
		var token = data.token || "";
		var path = data.cwd || "/";
		var pid = data.pid || 0;
		if(ValidateToken(token))
		{
			if(path.startsWith("$NATURAL"))
			{
				path = natural + path.slice(path.indexOf("$NATURAL") + 8);
			}
			UserCanRead(GetUserFromToken(token), path, function(err, can)
			{
				if(err)
				{
					console.error(err);
					socket.emit("error", {task: "import", code: 500, msg: "Internal Server Error", pid: pid});
					return;
				}
				if(!can)
				{
					socket.emit("error", {task: "import", code: 403, msg: "Unauthorized", pid: pid});
					return;
				}
				fs.readFile(path, "utf8", function(err, data)
				{
					if(err)
					{
						console.error(err);
						socket.emit("error", {task: "import", code: 500, msg: "Internal Server Error", pid: pid});
						return;
					}
					socket.emit("response", {task: "import", pid: pid, response: data});
				});
			});
		}
		else
		{
			socket.emit("authenticated", {task: "import", valid: false, pid: pid});
		}
	});
	socket.on("ls", function(data)
	{
		var token = data.token || "";
		var path = data.cwd || "/";
		var pid = data.pid || 0;
		if(ValidateToken(token))
		{
			if(path.startsWith("$NATURAL"))
			{
				path = natural + path.slice(path.indexOf("$NATURAL") + 8);
			}
			UserCanRead(GetUserFromToken(token), path, function(err, can)
			{
				if(err)
				{
					console.error(err);
					socket.emit("error", {task: "ls", code: 500, msg: "Internal Server Error", pid: pid});
					return;
				}
				if(!can)
				{
					socket.emit("error", {task: "ls", code: 403, msg: "Unauthorized", pid: pid});
					return;
				}
				fs.readdir(path, function(err, files)
				{
					if(err)
					{
						console.error(err);
						socket.emit("failure", {task: "ls", pid: pid});
						return;
					}
					socket.emit("response", {task: "ls", files: files, pid: pid});
				});
			});
		}
		else
		{
			socket.emit("authenticated", {task: "ls", valid: false, pid: pid});
		}
	});
}

//io.set("origins", "http://" + ip.address() + ":4567/");

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
	var myip = ip.address();
	res.setHeader("Strict-Transport-Security", "max-age=31536000 ; includeSubDomains");
	res.setHeader("X-XSS-Protection", "0");
	res.setHeader("X-Frame-Options", "deny");
	res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; connect-src 'self' ws://" + myip + ":4567/ wss://" + myip + ":4567/");
	return next();
});

console.log("The server is running at port 4567");

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
	if((req.session) && (req.session.logged))
	{
		res.sendFile(__dirname + "/private/" + req.params.resource);
	}
	else
	{
		res.redirect("/");
	}
});

app.get("/filesystem/:type", function(req, res)
{
	if((req.session) && (req.session.logged))
	{
		if(req.params["type"] == "application")
		{
			var file = req.query.file || "";
			var token = GetTokenFromUser(req.session.username);
			UserCanRead(GetUserFromToken(token), natural + "/bin/" + file, function(err, can)
			{
				if(err)
				{
					console.error(err);
					res.send("");
					return;
				}
				if(can)
				{
					fs.readFile(natural + "/bin/" + file, "utf8", function(err, data)
					{
						if(err)
						{
							console.error(err);
							res.send("");
							return;
						}
						res.send(data);
					});
				}
			});
		}
		else
		{
			res.send("");
		}
	}
	else
	{
		res.send("");
	}
});

io.on("connection", function(socket) // Sistema de autenticación de sockets.
{
	var gtoken = "";
	socket.emit("ready", {});
	socket.on("authenticate", function(data)
	{
		var token = data.token || "";
		if(!ValidateToken(token))
		{
			socket.emit("authenticated", {valid: false});
		}
		else
		{
			socket.emit("authenticated", {valid: true});
			gtoken = token;
			initSocket(socket, token);
		}
	});
	socket.on("disconnect", function()
	{
		var index = validTokens.indexOf(gtoken);
		if(index < 0)
		{
			console.error("Invalid token [" + gtoken + "] for logout, EIGNORED");
			return;
		}
		validTokens.splice(index, 1);
	});
});
