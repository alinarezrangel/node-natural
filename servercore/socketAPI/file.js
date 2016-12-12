/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Read, write and handle files via SocketAPI
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

var group = require("../group");
var tokens = require("../tokens");
var fs = require("fs");

module.exports = function(socket, configuration)
{
	socket.on("api.file.readAll", function(data)
	{
		var token = data.token || "";
		var pid = data.pid || 0;
		var task = "api.file.readAll";
		var path = data.path || ""; // can be relative
		var readAs = data.readAs || "binaryblob";
		if(tokens.ValidateToken(token))
		{
			if(path.startsWith("$NATURAL"))
			{
				path = configuration.__natural + path.slice(path.indexOf("$NATURAL") + 8);
			}
			var uname = tokens.GetUserFromToken(token);
			group.UserCanRead(uname, path, function(err, can)
			{
				if(err)
				{
					console.error(err);
					socket.emit("error-response", {"task": task, "code": 500, "msg": "Internal Server Error", "pid": pid});
					return;
				}

				if(!can)
				{
					socket.emit("error-response", {"task": task, "code": 403, "msg": "Unauthorized", "pid": pid});
					return;
				}

				fs.readFile(path, "utf8", function(err, data)
				{
					if(err)
					{
						console.error(err);
						socket.emit("error-response", {"task": task, "code": 500, "msg": "Internal Server Error", "pid": pid});
						return;
					}

					if(readAs == "stringUTF8")
					{
						data = data.toString("utf-8");
					}

					socket.emit("response", {"task": task, "filecontent": data, "pid": pid});
				});
			});
			// socket.emit("error-response", {"task": task, "code": 0, "msg": "", "pid": pid});
			// socket.emit("response", {"task": task, ..., "pid": pid});
		}
		else
		{
			socket.emit("authenticated", {"task": task, "valid": false, "pid": pid});
		}
	});
};
