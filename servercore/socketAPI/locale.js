/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Locale get using the socket API
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

module.exports = function(socket, configuration)
{
	socket.on("api.locale.get", function(data)
	{
		var token = data.token || "";
		var pid = data.pid || 0;
		var task = "api.locale.get";
		if(tokens.ValidateToken(token))
		{
			// socket.emit("error-response", {"task": task, "code": 0, "msg": "", "pid": pid});
			// socket.emit("response", {"task": task, ..., "pid": pid});
			socket.emit("response", {"task": task, "locale": configuration.locale, "pid": pid});
		}
		else
		{
			socket.emit("authenticated", {"task": task, "valid": false, "pid": pid});
		}
	});
};
