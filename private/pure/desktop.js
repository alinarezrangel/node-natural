/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Pure desktop event manager.
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

function PureMakeTextNode(text)
{
	return document.createTextNode(text);
}

function PureExecuteTemplate(template, arguments)
{
	var tmp = document.importNode(template, true);
	var t = $(tmp);

	var classes = t.find("*[data-template-class-insert]");
	classes.each(function(node)
	{
		node.addClass(arguments[node.data("templateClassInsert")]);
	});
	var texts = t.find("*[data-template-text-insert]");
	texts.each(function(node)
	{
		node.get(0).appendChild(PureMakeTextNode(arguments[node.data("templateTextInsert")]));
	});

	return tmp;
}

NaturalOnLoadevent = function()
{
	$(".puredesktop-main-content").get(0).appendChild(
		PureExecuteTemplate(
			$("#puredesktop-window").get(0),
			{
				"color": "color-natural-magenta",
				"title": "Hello World"
			}
		)
	);
};

window.addEventListener("load", function()
{
	NaturalLoadNext();
	console.log("PureDE loaded DOM " + NaturalLoadingIndex);
});
