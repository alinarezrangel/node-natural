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
router.get("/:url", function(req, res, next)
{
	var url = req.params.url || "";
	request(decodeURIComponent(url), function(err, resp, body)
	{
		if(err)
		{
			console.error("Error requesting " + err);
			res.status(500);
			res.send("");
			return;
		}
		res.status(resp.statusCode);
		res.send(body.replace("\"/", "\"/embed/web/"));
	});
});

module.exports = router;
