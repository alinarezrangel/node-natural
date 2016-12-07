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
		"mainColor": "#FFF",
		"textColor": "#000",
		"sliderColor": "#008080",
		"borderColor": "#000",
		"successColor": "#5A1",
		"menuColor": "#AAA",
		"snackColor": "#222",
		"snackTextColor": "#EE0",
		"buttonColor": "#ABABAB"
	};
}

function NWidgetsPack(container, widget)
{
	container.appendChild(widget);
}

function NWidgetsCreateMenuBar(style, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var menubar = document.createElement("div");
	menubar.className = "top-navigation";
	menubar.style.backgroundColor = style.menuColor;
	menubar.style.color = style.color;

	return menubar;
}

function NWidgetsCreateMenu(style, text, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var menu = document.createElement("div");
	menu.className = "link";
	menu.style.backgroundColor = style.menuColor;
	menu.style.color = style.textColor;
	menu.appendChild(document.createTextNode(text));

	return menu;
}

function NWidgetsCreateSnack(style, textualContent, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var snack = document.createElement("div");
	var text = document.createElement("div");
	var closebtn = document.createElement("span");
	snack.className = "snack";
	snack.style.backgroundColor = style.snackColor;
	snack.style.color = style.snackTextColor;
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

function NWidgetsCreateCombobox(style, editable, options, defaultFunction, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

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
		input.type = "text";
		input.value = "";
		input.name = "";
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

	combobox.className = "user-cant-select box width-block no-padding margin-8 flexible direction-row no-wrap justify-space-around border-bottom";
	combobox.style.width = "80% !important";
	combobox.style.marginLeft = "auto !important";
	combobox.style.marginRight = "auto !important";
	combobox.style.boxSizing = "border-box !important";
	combobox.dataset["naturalWidgetsComboboxValue"] = "";
	darrow.className = "box o1 padding-4 no-margin dropdown";
	darrow_text.className = "nic";
	dropdown.className = "dropdown-content box card no-margin";
	dropdown.style.padding = "2px 0px";

	combobox.style.backgroundColor = style.mainColor;
	combobox.style.color = style.textColor;
	combobox.style.borderColor = style.borderColor;
	/*darrow.style.backgroundColor = style.mainColor;
	darrow.style.color = style.textColor;
	dropdown.style.backgroundColor = style.mainColor;
	dropdown.style.color = style.textColor;
	input.style.backgroundColor = style.mainColor;
	input.style.color = style.textColor;*/

	combobox.appendChild(darrow);
	combobox.appendChild(input);
	darrow.appendChild(darrow_text);
	darrow_text.appendChild(darrow_text_it);
	darrow.appendChild(dropdown);

	darrow.addEventListener("mouseenter", function()
	{
		var sl = darrow.scrollLeft;
		var st = darrow.scrollTop;
		var el = darrow.parentElement;
		while(true)
		{
			sl += el.scrollLeft;
			st += el.scrollTop;
			if(el.classList.contains("window"))
			{
				break;
			}
			el = el.parentElement;
		}
		var x = darrow.offsetLeft - sl;
		var y = darrow.offsetTop - st;
		NaturalLog("Hovered " + x + "px :" + y + "px");
		dropdown.style.left = x + "px";
		dropdown.style.top = y + "px";
		NaturalLog("Res " + dropdown.style.left + " : " + dropdown.style.top);
	});

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
		opt.style.backgroundColor = style.mainColor;
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
					opt.dataset["naturalWidgetsComboboxRValue"];
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
			var ev = new CustomEvent("oninput", {
				value: this.dataset["naturalWidgetsComboboxValue"]
			});
			combobox.dispatchEvent(ev);
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

function NWidgetsSetComboboxValue(combobox, name, value)
{
	combobox.dataset["naturalWidgetsComboboxValue"] = value;
	var node = combobox.childNodes[1];
	if(node.classList.contains("input"))
	{
		node.value = value;
	}
	else
	{
		while(node.firstChild)
			node.removeChild(node.firstChild);

		node.appendChild(document.createTextNode(name));
	}
}

function NWidgetsCreateSlider(style, initialValue, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var container = document.createElement("div");
	container.className = "nwslider";
	container.style.borderColor = style.borderColor;
	var slided = document.createElement("div");
	slided.className = "nwslided";
	slided.style.borderColor = slided.style.backgroundColor = style.sliderColor;

	container.dataset["naturalWidgetsSliderValue"] = initialValue;
	slided.style.left = initialValue + "%";
	container.dataset["naturalWidgetsSliderDown"] = "false";

	container.addEventListener("mousedown", function()
	{
		this.dataset["naturalWidgetsSliderDown"] = "true";
	});

	container.addEventListener("mouseup", function()
	{
		var ev = new CustomEvent("oninput", {
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
	slider.getElementsByClassName("nwslided")[0].style.left = value + "%";
}

function NWidgetsCreateNumberInput(style, editable, startValue, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var number = document.createElement("div");
	var buttons = document.createElement("div");
	var btnUp = document.createElement("div");
	var btnUpLabel = document.createElement("span");
	var btnDown = document.createElement("div");
	var btnDownLabel = document.createElement("span");
	var input = null;

	if(editable)
	{
		input = document.createElement("input");
		input.className = "input box no-border padding-2 o2 f1";
		input.value = startValue;
	}
	else
	{
		input = document.createElement("span");
		input.className = "box no-border padding-2 o2 f1";
		input.appendChild(document.createTextNode(startValue));
	}

	number.className = "flexible box margin-8 padding-2 box border-bottom bs-1";
	number.style.color = style.textColor;
	number.style.width = "auto";
	number.style.backgroundColor = style.mainColor;
	buttons.className = "o1 box no-margin padding-1 border-right";
	buttons.style.borderColor = style.borderColor;
	btnUp.className = "box no-margin no-padding";
	btnUp.style.cssFloat = "left";
	btnUp.style.clear = "both";
	btnDown.className = "box no-margin no-padding";
	btnDown.style.cssFloat = "left";
	btnDown.style.clear = "both";
	btnUpLabel.className = "font-bold nic text-big";
	btnUpLabel.style.color = style.successColor;
	btnDownLabel.className = "font-bold nic text-big";
	btnDownLabel.style.color = style.successColor;

	btnUp.style.cursor = btnDown.style.cursor = "pointer";

	input.style.margin = "auto";

	number.appendChild(buttons);
	buttons.appendChild(btnUp);
	btnUp.appendChild(btnUpLabel);
	btnUpLabel.appendChild(document.createTextNode("k"));
	buttons.appendChild(btnDown);
	btnDown.appendChild(btnDownLabel);
	btnDownLabel.appendChild(document.createTextNode("j"));
	number.appendChild(input);

	number.dataset["naturalWidgetsNumberValue"] = startValue;

	btnUp.addEventListener("click", function()
	{
		var v = parseInt(number.dataset["naturalWidgetsNumberValue"]);
		number.dataset["naturalWidgetsNumberValue"] = v + 1;

		if(editable)
		{
			input.value = number.dataset["naturalWidgetsNumberValue"];
		}
		else
		{
			while(input.firstChild)
				input.removeChild(input.firstChild);
			input.appendChild(
				document.createTextNode(number.dataset["naturalWidgetsNumberValue"])
			);
		}
	});

	btnDown.addEventListener("click", function()
	{
		var v = parseInt(number.dataset["naturalWidgetsNumberValue"]);
		number.dataset["naturalWidgetsNumberValue"] = v - 1;

		if(editable)
		{
			input.value = number.dataset["naturalWidgetsNumberValue"];
		}
		else
		{
			while(input.firstChild)
				input.removeChild(input.firstChild);
			input.appendChild(
				document.createTextNode(number.dataset["naturalWidgetsNumberValue"])
			);
		}
	});

	return number;
}

function NWidgetsGetNumberInputValue(number)
{
	return parseInt(number.dataset["naturalWidgetsNumberValue"]);
}

function NWidgetsSetNumberInputValue(number, value)
{
	number.dataset["naturalWidgetsNumberValue"] = value;
	var input = number.childNodes[1];
	if(input.classList.contains("input"))
	{
		input.value = value;
	}
	else
	{
		while(input.firstChild)
			input.removeChild(input.firstChild);
		input.appendChild(document.createTextNode(value));
	}
}

function NWidgetsCreateButton(style, textualContent, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var button = document.createElement("button");
	button.className = "button";
	button.style.color = style.textColor;
	button.style.backgroundColor = style.buttonColor;

	button.type = "button";
	button.appendChild(document.createTextNode(textualContent));

	return button;
}

function NWidgetsSetButtonValue(button, text)
{
	while(button.firstChild)
		button.removeChild(button.firstChild);
	button.appendChild(document.createTextNode(text));
}

function NWidgetsCreateLabel(style, textualContent, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var label = document.createElement("span");
	label.className = "label";
	label.style.color = style.textColor;

	label.appendChild(document.createTextNode(textualContent));

	return label;
}

function NWidgetsSetLabelValue(label, text)
{
	while(label.firstChild)
		label.removeChild(label.firstChild);
	label.appendChild(document.createTextNode(text));
}

function NWidgetsCreateTextInput(style, textualContent, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var input = document.createElement("input");
	input.type = "text";
	input.className = "input inputtext width-block padding-4";

	input.style.backgroundColor = style.mainColor;
	input.style.color = style.textColor;
	input.style.borderColor = style.borderColor;

	input.value = textualContent;

	return input;
}

function NWidgetsSetTextInputValue(input, text)
{
	input.value = text;
}

function NWidgetsGetTextInputValue(input)
{
	return input.value;
}

function NWidgetsCreateContainer(style, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var container = document.createElement("div");
	container.className = "container";
	container.style.color = style.textColor;
	container.style.backgroundColor = style.mainColor;

	return container;
}

function NWidgetsCreateFrame(style, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var container = document.createElement("div");
	container.className = "container border";
	container.style.borderColor = style.borderColor;
	container.style.color = style.textColor;
	container.style.backgroundColor = style.mainColor;

	return container;
}

function NWidgetsCreateAccordion(style, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var accordion = document.createElement("div");
	accordion.className = "container no-padding border";
	accordion.style.borderColor = style.borderColor;
	accordion.style.color = style.textColor;
	accordion.style.backgroundColor = style.mainColor;

	return accordion;
}

function NWidgetsCreateAccordionSection(style, title, substyle)
{
	if(typeof substyle !== "undefined")
	{
		style = substyle;
	}

	var section = document.createElement("div");
	var titlebar = document.createElement("div");
	var content = document.createElement("div");
	section.className = "container no-margin no-padding";
	section.style.backgroundColor = style.mainColor;
	section.style.color = style.textColor;

	return section;
}
