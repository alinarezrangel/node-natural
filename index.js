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

var group = require("./servercore/group");
var sha256 = require("./servercore/sha256");
var tokens = require("./servercore/tokens");
var framewrapper = require("./servercore/framewrapper");

var natural = __dirname + "/natural"; // Directorio con los datos de la instalacion y configuración.

var configuration = JSON.parse(fs.readFileSync(natural + "/config.json", "utf8"));

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
	//var myip = ip.address();
	res.setHeader("Strict-Transport-Security", "max-age=31536000 ; includeSubDomains");
	res.setHeader("X-XSS-Protection", "0");
	res.setHeader("X-Frame-Options", "deny");
	//res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; connect-src 'self' ws://" + myip + ":4567/ wss://" + myip + ":4567/");
	res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; connect-src 'self' ws: wss:");
	return next();
});
app.use("/embed/web/", framewrapper);

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
		//console.log("gived " + GetTokenFromUser(req.session.username));
		res.send(tokens.GetTokenFromUser(req.session.username));
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
			/*
			Obtenemos el token del usuario y despues el usuario del token.
			Es así para poder asegurarnos de que el que esta ejecutando la
			consulta tenga un token y por ende, este en el sistema.
			*/
			var token = tokens.GetTokenFromUser(req.session.username);
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
