/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Server core.
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
var path = require("path");
var favicon = require("serve-favicon");

var group = require("./servercore/group");
var sha256 = require("./servercore/sha256");
var tokens = require("./servercore/tokens");
var framewrapper = require("./servercore/framewrapper");
var docswrapper = require("./servercore/docswrapper");
var socketAPI = require("./servercore/socketAPI");

var natural = __dirname + "/natural"; // Directorio con los datos de la instalacion y configuración.

var configuration = JSON.parse(fs.readFileSync(natural + "/config.json", "utf8"));

configuration.__natural = natural;
configuration.__nodenatural = {
	"ip": {
		"address": ip.address()
	}
};

docswrapper = docswrapper(configuration);

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
		if(tokens.ValidateToken(token))
		{
			if(path.startsWith("$NATURAL"))
			{
				path = natural + path.slice(path.indexOf("$NATURAL") + 8);
			}
			group.UserCanRead(tokens.GetUserFromToken(token), path, function(err, can)
			{
				if(err)
				{
					console.error(err);
					socket.emit("error-response", {task: "import", code: 500, msg: "Internal Server Error", pid: pid});
					return;
				}
				if(!can)
				{
					socket.emit("error-response", {task: "import", code: 403, msg: "Unauthorized", pid: pid});
					return;
				}
				fs.readFile(path, "utf8", function(err, data)
				{
					if(err)
					{
						console.error(err);
						socket.emit("error-response", {task: "import", code: 500, msg: "Internal Server Error", pid: pid});
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
		if(tokens.ValidateToken(token))
		{
			if(path.startsWith("$NATURAL"))
			{
				path = natural + path.slice(path.indexOf("$NATURAL") + 8);
			}
			group.UserCanRead(tokens.GetUserFromToken(token), path, function(err, can)
			{
				console.log("Trying to read all files and directories in " + path);
				if(err)
				{
					console.error(err);
					socket.emit("error-response", {task: "ls", code: 500, msg: "Internal Server Error", pid: pid});
					return;
				}
				if(!can)
				{
					console.error("Unauthorized");
					socket.emit("error-response", {task: "ls", code: 403, msg: "Unauthorized", pid: pid});
					return;
				}
				if(path.charAt(path.length - 1) != "/")
				{
					path += "/";
				}
				fs.readdir(path, function(err, files)
				{
					if(err)
					{
						console.error(err);
						socket.emit("failure", {task: "ls", pid: pid});
						return;
					}
					var i = 0;
					for(i = 0; i < files.length; i++)
					{
						var filename = files[i];
						var stats = fs.lstatSync(path + filename);
						files[i] = {
							"filename": filename,
							"isDirectory": stats.isDirectory()
						};
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
	socketAPI(socket, configuration);
}

//io.set("origins", "http://" + ip.address() + ":4567/");

app.use(favicon(path.join(__dirname, "public", "images", "logicon.svg")));
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
	secret: configuration.publicHash,
	httpOnly: true,
	resave: false,
	saveUninitialized: false
}));
app.use(function(req, res, next) // CSP headers
{
	//var myip = ip.address();
	res.setHeader("Strict-Transport-Security", "max-age=31536000 ; includeSubDomains");
	res.setHeader("X-XSS-Protection", "0");
	res.setHeader("X-Frame-Options", "SAMEORIGIN");
	res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; connect-src 'self' ws: wss:");
	return next();
});
app.use("/embed/web/", framewrapper);
app.use("/embed/docs/", docswrapper);

console.log("Welcome to Natural " + configuration.codeName + " v" + configuration.naturalVersion);
console.log("Client locale " + configuration.locale);
console.log("Client DE " + configuration.desktopManager);
console.log("Starting Natural server");

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
		var name = "pure";
		configuration.availablesDesktopManagers.forEach(function(value, index)
		{
			if(value.name == configuration.desktopManager)
			{
				name = value.file;
				console.log("Loaded DE " + value.name + " v" + value.version);
				console.log("> " + value.description);
			}
		});
		res.sendFile(__dirname + "/private/" + name + "/desktop.html");
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
			res.redirect("/?error=enopass");
			return;
		}
		if(us != "userExist")
		{
			console.error(new Error("The user not exist"));
			res.redirect("/?error=enopass");
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
			tokens.PushNewToken(tokens.MakeNewtoken(username));
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
		console.log("gived " + tokens.GetTokenFromUser(req.session.username));
		res.send("<token>" + tokens.GetTokenFromUser(req.session.username) + "</token>");
		req.session.tokenized = true;
	}
	else
	{
		res.send("none");
	}
});

app.use("/private/", function(req, res) // Acceso a recursos privados.
{
	if((req.session) && (req.session.logged))
	{
		// FIXME: We should verify that req.path is **inside** of the
		// (__dirname + "/private/") directory or we can make a malicious
		// path like "../../super/secret/keep_me_hidden.txt".
		fs.realpath(__dirname + "/private/" + req.path, function(err, resourcePath)
		{
			if(err)
			{
				console.error(err);
				res.send("");
				return;
			}
			fs.realpath(__dirname + "/private/", function(err, privatePath)
			{
				if(err)
				{
					console.error(err);
					res.send("");
					return;
				}
				var cp = resourcePath;
				console.log("Reducing: " + cp + " by " + privatePath);
				while((path.normalize(cp) != path.normalize(privatePath)) && (path.normalize(cp) != "/"))
				{
					console.log("At: " + cp);
					cp = path.dirname(cp);
				}
				if(path.normalize(cp) == "/") // The path req.path is not inside the /private/ dir
				{
					console.error("Error: " + resourcePath + " is not inside " + privatePath);
					res.send("");
					return;
				}
				res.sendFile(__dirname + "/private/" + req.path);
			});
		});
	}
	else
	{
		res.redirect("/");
	}
});

// In /filesystem/ we not validate that the path is inside the $NATURAL
// directory, this is for enable to open other javascript files as modules
// in other dirs (like ~/.natural/modules/ or ~/.natural/bin/)
app.get("/filesystem/:type", function(req, res)
{
	if((req.session) && (req.session.logged))
	{
		if(req.params["type"] == "application")
		{
			var file = req.query.file || "";
			var token = req.query.token || "";

			if(!tokens.ValidateToken(token))
			{
				console.error("Invalid token for filesystem app " + file);
				res.send("");
				return;
			}

			group.UserCanRead(tokens.GetUserFromToken(token), natural + "/bin/" + file, function(err, can)
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
		else if(req.params["type"] == "module")
		{
			var file = req.query.file || "";
			var token = req.query.token || "";

			if(!tokens.ValidateToken(token))
			{
				console.error("Invalid token for filesystem app " + file);
				res.send("");
				return;
			}

			group.UserCanRead(tokens.GetUserFromToken(token), natural + "/" + file, function(err, can)
			{
				if(err)
				{
					console.error(err);
					res.send("");
					return;
				}
				if(can)
				{
					fs.readFile(natural + "/" + file, "utf8", function(err, data)
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
		if(!tokens.ValidateToken(token))
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
		tokens.DeleteToken(gtoken);
	});
});
