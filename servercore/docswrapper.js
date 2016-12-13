/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Frame Wrapper for skip IFRAMES.
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


router.use(function(req, res) // Acceso a recursos de documentacion.
{
	if((req.session) && (req.session.logged))
	{
		// FIXME: We should verify that req.path is **inside** of the
		// (conf.__natural + "/share/docs/") directory or we can make a malicious
		// path like "../../super/secret/keep_me_hidden.txt".
		fs.realpath(conf.__natural + "/share/docs/" + req.path, function(err, resourcePath)
		{
			if(err)
			{
				console.error(err);
				res.send("");
				return;
			}
			fs.realpath(conf.__natural + "/share/docs/", function(err, privatePath)
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
				res.sendFile(conf.__natural + "/share/docs/" + req.path);
			});
		});
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
