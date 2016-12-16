/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Frame Wrapper for skip DATA URIs.
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
var request = require("request");
var fs = require("fs");
var path = require("path");
var router = express.Router();

var conf = {};

router.use(function(req, res) // Acceso a recursos de DATA:.
{
	if((req.session) && (req.session.logged))
	{
		var data = req.query["data"];

		var ss = data.substr(5, data.indexOf(",") - 5).split(";");
		var content = data.substr(data.indexOf(",") + 1, data.length);

		if(ss.length == 0)
		{
			res.send("");
			console.error("Invalid data " + data);
			return;
		}

		if(ss.indexOf("base64") >= 0)
		{
			content = (new Buffer(content, "base64")).toString("utf-8");
		}

		res.type(ss[0]);
		res.send(content);
	}
	else
	{
		res.redirect("/");
	}
});

module.exports = function(config)
{
	conf = config;
	return router;
};
