/*
Envoltura para poder utilizar IFRAMES hacia sitios web que
no los permiten
*/

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
