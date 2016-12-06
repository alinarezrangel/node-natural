/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Widgets for design of GUIs and NUIs.
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

function NWidgetsCreateAppStyle()
{
	return {
		"mainColor": "#CCC",
		"textColor": "#000",
		"sliderColor": "#008080"
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

function NWidgetsCreateCombobox(style, editable, options, defaultFunction)
{
	if((typeof defaultFunction) === "undefined")
	{
		defaultFunction = function(at) {return false;};
	}

	var combobox = document.createElement("div");
	var input = null;
	var input_cc = null;

	if(editable)
	{
		input = document.createElement("input");
		input.className = "user-can-select input no-padding no-margin no-border f1 o2";
		input.style.border = "0px !important";
		input.style.color = style.textColor;
	}
	else
	{
		input = document.createElement("span");
		input.className = "user-can-select box no-padding no-margin f1 o2";
		input_cc = document.createTextNode("");
		input.appendChild(input_cc);
		input.style.color = style.textColor;
	}

	var darrow = document.createElement("div");
	var darrow_text = document.createElement("span");
	var darrow_text_it = document.createTextNode("o");
	var dropdown = document.createElement("div");

	combobox.className = "user-cant-select box width-block padding-2 margin-8 flexible direction-row no-wrap justify-space-around border-bottom";
	combobox.style.width = "80% !important";
	combobox.style.marginLeft = "auto !important";
	combobox.style.marginRight = "auto !important";
	combobox.style.boxSizing = "border-box !important";
	combobox.dataset["naturalWidgetsComboboxValue"] = "";
	darrow.className = "box o1 padding-4 no-margin dropdown";
	darrow_text.className = "nic";
	dropdown.className = "dropdown-content box card no-margin";
	dropdown.style.padding = "2px 0px";

	combobox.appendChild(input);
	combobox.appendChild(darrow);
	darrow.appendChild(darrow_text);
	darrow_text.appendChild(darrow_text_it);
	darrow.appendChild(dropdown);

	var i = 0;
	var j = options.length;
	for(i = 0; i < j; i++)
	{
		var at = options[i];
		var opt = document.createElement("span");
		opt.className = "user-cant-select box width-block no-margin hoverable";
		opt.style.padding = "16px 32px";
		opt.style.float = "left";
		opt.style.clear = "both";
		opt.style.cursor = "pointer";
		opt.style.color = style.textColor;
		opt.dataset["naturalWidgetsComboboxValue"] = at.name;
		opt.dataset["naturalWidgetsComboboxRValue"] = at.value;

		opt.appendChild(document.createTextNode(at.name));

		dropdown.appendChild(opt);

		if(defaultFunction(at))
		{
			if(editable)
			{
				input.value = opt.dataset["naturalWidgetsComboboxValue"];
				combobox.dataset["naturalWidgetsComboboxValue"] =
					this.dataset["naturalWidgetsComboboxRValue"];
			}
			else
			{
				while(input.firstChild)
					input.removeChild(input.firstChild);
				input.appendChild(document.createTextNode(opt.dataset["naturalWidgetsComboboxValue"]));
				combobox.dataset["naturalWidgetsComboboxValue"] =
					opt.dataset["naturalWidgetsComboboxRValue"];
			}
		}

		opt.addEventListener("click", function()
		{
			if(editable)
			{
				input.value = this.dataset["naturalWidgetsComboboxValue"];
				combobox.dataset["naturalWidgetsComboboxValue"] =
					this.dataset["naturalWidgetsComboboxRValue"];
			}
			else
			{
				while(input.firstChild)
					input.removeChild(input.firstChild);
				input.appendChild(document.createTextNode(this.dataset["naturalWidgetsComboboxValue"]));
				combobox.dataset["naturalWidgetsComboboxValue"] =
					this.dataset["naturalWidgetsComboboxRValue"];
			}
		});
	}

	return combobox;
}

function NWidgetsGetComboboxValue(combobox)
{
	return combobox.dataset["naturalWidgetsComboboxValue"];
}

function NWidgetsCreateSlider(style, initialValue)
{
	var container = document.createElement("div");
	container.className = "nwslider";
	container.style.borderColor = style.textColor;
	var slided = document.createElement("div");
	slided.className = "nwslided";
	slided.style.borderColor = slided.style.backgroundColor = style.sliderColor;

	container.dataset["naturalWidgetsSliderValue"] = initialValue;
	container.dataset["naturalWidgetsSliderDown"] = "false";

	container.addEventListener("mousedown", function()
	{
		this.dataset["naturalWidgetsSliderDown"] = "true";
	});

	container.addEventListener("mouseup", function()
	{
		var ev = new CustomEvent("valuechanged", {
			value: this.dataset["naturalWidgetsSliderValue"]
		});
		this.dispatchEvent(ev);
		this.dataset["naturalWidgetsSliderDown"] = "false";
	});

	container.addEventListener("mousemove", function(ev)
	{
		if(this.dataset["naturalWidgetsSliderDown"] != "true")
			return;
		var x = ev.clientX - this.getBoundingClientRect().left - (slided.offsetWidth / 2);
		this.dataset["naturalWidgetsSliderValue"] = Math.max(
			Math.min(
				Math.round(
					((x + slided.offsetWidth / 2) * 100) / this.offsetWidth),
					100
				),
			0
		) + "";
		slided.style.left = x + "px";
	});

	container.appendChild(slided);

	return container;
}

function NWidgetsGetSliderValue(slider)
{
	return parseInt(slider.dataset["naturalWidgetsSliderValue"]);
}

function NWidgetsSetSliderValue(slider, value)
{
	slider.dataset["naturalWidgetsSliderValue"] = value;
	var a = slider.offsetWidth;
	slider.firstChild.style.left = ((value / 100) * a) + "px";
}

