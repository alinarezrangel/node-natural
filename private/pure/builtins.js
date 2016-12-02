/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Pure desktop builtins apps.
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

// Async for better performance

setTimeout(function()
{
	"use strict";

	PureCreateApplication("__purewelcome", "Welcome to Pure", function(args)
	{
		var window = PureMakeDefaultWindowLayout("__purewelcome", {
			"title": "Welcome to Pure",
			"color": "color-natural-bluegrey",
			"bkgcolor": "color-natural-white"
		});
		PureSetWindowPosition(window, 20, 20);
		PureSetWindowSize(window, 250, 400);
		PureOpenWindow(window);
	});
}, 0);
