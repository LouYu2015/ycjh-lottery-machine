/*
MIT License

Copyright (c) 2017 Yu Lou

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function myConfirmation() {
	return 'Are you sure you want to quit?';
}

window.onbeforeunload = myConfirmation;

var mapping = [];
var prompt_timeout = 2000;
var dynamic_height_adjust_internal = 100;
var number_of_lottery_numbers = 10;
var current_lottery_numbers = [], history_lottery_numbers = [];
var updating_lottery_number = true, update_interval = 1000/24;
var interface_list = ["main_interface", "settings_interface", "copyright_interface"];

/* ====== Interface switch ====== */

function swith_to_interface(interface)
{
	for (var i = 0; i < interface_list.length; i++)
	{
		var is_current_interface = (interface_list[i] == interface)
		document.getElementById(interface_list[i]).hidden = !is_current_interface;
	}
	show_settings_values();
}

/* ====== Height change animation ====== */

function adjust_dynamic_height()
{
	var elements = ["lottery_number", "history_area", "settings_interface", "copyright_interface"]
	for (var i = 0; i < elements.length; i++)
	{
		adjust_height_for(elements[i]);
	}
	setTimeout("adjust_dynamic_height()", dynamic_height_adjust_internal);
}

function adjust_height_for(element)
{
	var target_div = document.getElementById(element);
	var measure_div = document.getElementById(element + "_measure");
	target_div.style.height = measure_div.clientHeight + "px";
}

/* ====== Lottery interface ====== */

function random_range(min_number, max_number)
{
	return parseInt(Math.random() * (max_number - min_number) + min_number);
}

function is_element_in_array(e, a)
{
	for (var i=0; i<a.length; i++)
		if (e == a[i])
			return true;
	return false;
}

function random_range_list(min_number, max_number, n, exclude_list)
{
	var result = [];
	for (var i = 0; i < n; i++)
	{
		var new_number = random_range(min_number, max_number);
		while (is_element_in_array(new_number, result) || is_element_in_array(new_number, exclude_list))
		{
			new_number = random_range(min_number, max_number);
		}
		result.push(new_number);
	}
	return result;
}

/* display */

function draw_current_lottery_numbers()
{
	var result = "";
	for (var i = 0; i < current_lottery_numbers.length; i++)
	{
		var current_number = current_lottery_numbers[i];
		var button = "<button class=\"normal circle\" onclick='add_to_history("+ i +")'>+</button>";
		var current_line = "<p><span>"+ mapping[current_number]+ "</span>" + button + "</p>";
		result = result + current_line;
	}

	if (current_lottery_numbers.length == 0)
	{
		if (updating_lottery_number)
		{
			result = "<div>请设置抽取数量</div>";
			updating_lottery_number = false;
		}
		else
			result = "<div>请点击“开始”</div>"
	}
	document.getElementById("lottery_number_div").innerHTML = result;
}

function update_lottery_number()
{
	if (!updating_lottery_number)
		return;

	var min_lottery_number = 0;
	var max_lottery_number = mapping.length;

	if (min_lottery_number + number_of_lottery_numbers +
			history_lottery_numbers.length > max_lottery_number)
	{
		alert("抽取数量不能大于名单长度。请重新设置抽取数量。");
		number_of_lottery_numbers = max_lottery_number - min_lottery_number -
			history_lottery_numbers.length;
	}

	current_lottery_numbers = random_range_list(min_lottery_number, max_lottery_number, number_of_lottery_numbers, history_lottery_numbers);
	draw_current_lottery_numbers();
	setTimeout("update_lottery_number()", update_interval);
}

function draw_history()
{
	var result = "";
	for (var i = 0; i < history_lottery_numbers.length; i++)
	{
		var delete_code = "onclick='delete_history("+ i +")'";
		var button = "<button class=\"danger circle\"" + delete_code + ">-</button>";
		var line = "<p><span>" + mapping[history_lottery_numbers[i]] +
			"</span>" + button + "</p>";
		result += line;
	}

	if (history_lottery_numbers.length == 0)
		result = "<div>暂无历史记录</div>";

	document.getElementById("history_div").innerHTML = result;
}

function add_to_history(i)
{
	history_lottery_numbers.unshift(current_lottery_numbers[i]);
	current_lottery_numbers.splice(i, 1);
	draw_history();
	draw_current_lottery_numbers();
	number_of_lottery_numbers -= 1;
}

function delete_history(i)
{
	history_lottery_numbers.splice(i, 1);
	draw_history();
}

/* Buttons */

function on_start_button()
{
	updating_lottery_number = true;
	update_lottery_number();
}

function on_stop_button()
{
	updating_lottery_number=false;
}

function on_clear_button(force_clear = false)
{
	if (force_clear || confirm("确认要清空当前内容？"))
	{
		on_stop_button();
		current_lottery_numbers = [];
		draw_current_lottery_numbers();
	}
}

function on_save_history_button()
{
	history_lottery_numbers = current_lottery_numbers.concat(history_lottery_numbers);
	draw_history();
	on_clear_button(true);
}

function on_clear_history_button()
{
	if (confirm("确认要清空历史记录？"))
	{
		history_lottery_numbers = [];
		draw_history();
	}
}

/* ====== Settings interface ====== */

function show_settings_values()
{
	document.getElementById("input_number_of_lotteries").value = number_of_lottery_numbers.toString();
	document.getElementById("input_list").value = mapping.join("\n");
}

function on_save_button()
{
	mapping = document.getElementById("input_list").value.split("\n");
	number_of_lottery_numbers = parseInt(document.getElementById("input_number_of_lotteries").value);

	if (number_of_lottery_numbers < 0)
		number_of_lottery_numbers = 0;

	show_settings_values();
	show_prompt();
}

function show_prompt()
{
	document.getElementById("prompt_measure").innerHTML = "<p>已保存</p>";
	adjust_height_for("prompt");
	setTimeout("hide_prompt()", prompt_timeout);
}

function hide_prompt()
{
	document.getElementById("prompt_measure").innerHTML = "";
	adjust_height_for("prompt");
}

/* ====== Main ====== */

swith_to_interface("main_interface");
adjust_dynamic_height();
