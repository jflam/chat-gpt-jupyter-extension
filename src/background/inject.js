// This code will be injected by creating an element on the page and 
// injecting a script element onto the page so that I can access the
// existing Jupyter page code.

(function() {
	// Register a custom action that will either execute the 
	// current cell or pop an alert (simulate send to GPT)
	var send_to_chatgpt = function () {
		var cell = Jupyter.notebook.get_selected_cell();
		if (cell.cell_type == 'code') {
			const code = cell.get_text();
			if (code.startsWith('%chat')) {
				// TODO: actually send code to chat gpt (along with previous cells as context)
				console.log(`Send to ChatGPT ${code}`);

				// TODO: receive and parse response into markdown and code

				// TODO: remove test harness
				const markdown1 = "## This is a markdown cell";
				const code1 = "print('hello world')";
				const markdown2 = "## This is another markdown cell";

				// Insert test harness into page
				Jupyter.notebook.insert_cell_below();
				Jupyter.notebook.select_next();
				Jupyter.notebook.cells_to_markdown();
				Jupyter.notebook.get_selected_cell().set_text(markdown1);
				Jupyter.notebook.get_selected_cell().render();

				Jupyter.notebook.insert_cell_below();
				Jupyter.notebook.select_next();
				Jupyter.notebook.get_selected_cell().set_text(code1);

				Jupyter.notebook.insert_cell_below();
				Jupyter.notebook.select_next();
				Jupyter.notebook.cells_to_markdown();
				Jupyter.notebook.get_selected_cell().set_text(markdown2);
				Jupyter.notebook.get_selected_cell().render();
			} else {
				cell.execute();
			}
		} else {
			console.log("No selected cell");
		}
	};

	// TODO: figure out what real values to use for these
	var action = {
		icon: 'fa-comment', // a font-awesome class used on buttons, etc
		help    : 'Send to ChatGPT',
		help_index : 'zz',
		handler : send_to_chatgpt
	};
	var prefix = 'auto';
	var action_name = 'send-to-chatgpt';
	var full_action_name = Jupyter.actions.register(action, action_name, prefix); // returns 'auto:send-to-chatgpt'
	Jupyter.notebook.keyboard_manager.edit_shortcuts.add_shortcut('ctrl-enter', full_action_name);

	console.log('Im in yr page, injecting scripts');
})();