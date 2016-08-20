/*
Biblioteca de funciones sobre usuarios y grupos en UNIX-like systems
*/

var fs = require("fs");

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
		console.error("The user not match the uregex");
		callback(new Error("The user not match the uregex"));
		return;
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

module.exports = {
	GetUsernameFromUserID: GetUsernameFromUserID,
	GetGroupnameFromGroupID: GetGroupnameFromGroupID,
	IsUserInGroup: IsUserInGroup,
	UserCan: UserCan,
	UserCanWrite: UserCanWrite,
	UserCanRead: UserCanRead,
	UserCanExec: UserCanExec
};
