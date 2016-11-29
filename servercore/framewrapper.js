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
var router = express.Router();

// GET for the frame
router.use(function(req, res, next)
{
	var ourl = req.path;
	var url = "http:/" + ourl || "";
	console.log("Attempt to get " + url);
	request(decodeURIComponent(url), function(err, resp, body)
	{
		if(err)
		{
			console.error("Error requesting " + err);
			res.status(500);
			res.send("");
			return;
		}
		console.log("requesting " + url);
		res.status(resp.statusCode);
		res.type(resp.headers["content-type"]);

		if((resp.headers["content-type"] == "text/html") || (resp.headers["content-type"] == "application/xhtml+xml"))
		{
			var b = body.split(/\<[hH][eE][aA][dD]\>/gmi);
			var j = b[0] + "\r\n<head>\r\n<BASE href=\"/embed/web" + ourl + "\" target=\"_self\" />\r\n" + b[1];
			body = j;
		}

		res.send(body);
	});
});

module.exports = router;
