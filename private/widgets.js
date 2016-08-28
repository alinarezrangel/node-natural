/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Widgets for design of GUIs and NUIs.
***********************************
****************************************************************** */

function NWidgetsCreateAppStyle()
{
	return {
		"mainColor": "#CCC",
		"textColor": "#000"
	};
}

function NWidgetsPack(container, widget)
{
	container.appendChild(widget);
}

function NWidgetsCreateMenuBar(style)
{
	var menubar = document.createElement("div");
	menubar.className = "top-navigation";
	menubar.style.backgroundColor = style.mainColor;
	menubar.style.color = style.color;
	return menubar;
}

function NWidgetsCreateMenu(style, text)
{
	var menu = document.createElement("div");
	menu.className = "link";
	menu.style.backgroundColor = style.mainColor;
	menu.style.color = style.color;
	menu.appendChild(document.createTextNode(text));
	return menu;
}

function NWidgetsCreateSnack(style, textualContent)
{
	var snack = document.createElement("div");
	var text = document.createElement("div");
	var closebtn = document.createElement("span");
	snack.className = "snack";
	snack.style.backgroundColor = style.mainColor;
	snack.style.color = style.color;
	snack.style.display = "none";
	text.style.cssFloat = "left";
	closebtn.className = "nic text-ultra-big text-color-red";
	closebtn.style.cssFloat = "left";
	closebtn.style.marginLeft = "16px";
	closebtn.style.cursor = "pointer";
	closebtn.appendChild(document.createTextNode("e"));
	text.appendChild(document.createTextNode(textualContent));
	snack.appendChild(text);
	snack.appendChild(closebtn);
	closebtn.addEventListener("click", function(ev)
	{
		//snack.style.display = "none";
		$(snack).hide("slow");
	});
	return snack;
}

function NWidgetsShowSnack(snack)
{
	var parent = snack.parentElement;
	snack.style.bottom = "0%";
	snack.style.transform = "translateX(-50%)";
	snack.style.left = "50%";
	$(snack).show("slow");
	//snack.style.display = "block";
}
