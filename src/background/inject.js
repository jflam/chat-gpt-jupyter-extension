// The code in this file will be injected by creating an element on the page
// and injecting a script element onto the page so that I can access the
// existing Jupyter page code.

// TODO: Empirically determine the limit of CHAT GPT input token length for
// the question. But for now let's just use a 6000 character limit.

// TODO: move this file from the background to the content-script dir

const CHAR_LIMIT = 6000;

(function() {
	// Function that will search backwards through all cells and return a
	// string that contains the contents of all the concatenated cells that
	// start with ##### chat. This function will stop when it 

	// TODO: need to have a way to include changes that the user may have
	// manually added to the code.
	var get_previous_cells = function() {
		let cells = Jupyter.notebook.get_cells();
		let result = "";
		let current_cell = Jupyter.notebook.get_selected_index() + 1;
		for (let i = current_cell; i >= 0; i--) {
			let cell = cells[i];
			if (cell.cell_type == 'markdown') {
				let text = cell.get_text();
				if (text.startsWith('##### chat')) {
					text = text.replace(/^\s*\#\#\#\#\#\s*chat\s*/, "");
					result = text + result;
				} else if (text.startsWith("##### response")){
					text = text.replace(/^\s*\#\#\#\#\#\s*response\s*/, "");
					result = text + result;
				} 			
			}
		}
		return result;
	}

	// Dictionary that maps programming language to a markdown language string
	// Note that the keyword is always in lowercase.
	keyword_to_programming_language = {
		"python": "python",
		"java": "java",
		"c#": "csharp",
		"c sharp": "csharp",
		"javascript": "javascript",
		"f#": "fsharp",
		"php": "php",
		"r": "r",
	};

	// This function will try to detect the programming language of the
	// string that is passed in. It will return a string that can be used
	// by markdown to specify the language. This is a crappy heuristic that
	// only returns the first match. It will return unknown if no match is 
	// found.
	var detect_programming_language = function(str) {
		let str_lowercase = (str + " ").toLowerCase();
		for (const [key, value] of Object.entries(keyword_to_programming_language)) {
			if (str_lowercase.includes(" " + key + " ")) {
				return value;
			}
		}
		return "unknown";
	}

	// This function takes a response from ChatGPT which will contain markdown
	// code blocks. It will do two things: 1/ return a list of all the code
	// blocks and 2/ annotate the code blocks with the passed in programming
	// language.
	//
	// There is a special case in this function where there are no code blocks
	// detected in the response AND the language is NOT unknown. In that case
	// we will surround the entire annotatedResponse with a default code block
	// annotated iwth the language. I have seen ChatGPT return such "naked
	// code" responses and this is needed to handle this case.
	var extract_code_blocks = function(language, response) {
		// Do nothing if language is unknown
		if (language == "unknown") {
			return [response, []];
		}

		let lines = response.split("\n");
		let inCodeBlock = false;
		let annotatedResponse = [];
		let currentBlock = [];
		let codeBlocks = [];

		// iterate over the lines and look for markdown code blocks
		for (const line of lines) {
			if (line != "") {
				if (line.startsWith("```")) {
					inCodeBlock = !inCodeBlock;
					if (inCodeBlock) {
						// annotate the code block with the language
						annotatedResponse.push("```" + language);
					} else {
						// termainate the code block
						annotatedResponse.push("```");
						// add the current block to the list of code blocks
						codeBlocks.push(currentBlock.join("\n"));
						currentBlock = [];
					}
				} else {
					if (inCodeBlock) {
						// add the current line to the current block and the
						// annotated response
						currentBlock.push(line);
					}
					annotatedResponse.push(line);
				}
			}
		}

		if (codeBlocks.length == 0 && language != "unknown") {
			const code = annotatedResponse.join("\n");
			currentBlock.push(`\`\`\`${language}`)
			currentBlock.push(code);
			currentBlock.push("```");
			codeBlocks.push(code)
			return [currentBlock.join("\n"), codeBlocks];
		}
		else {
			return [annotatedResponse.join("\n"), codeBlocks];
		}
	}

	// It's odd that I need to strip out the language annotations from the
	// query. But if I don't then ChatGPT will sometimes change the language
	// based on my experiments to something random like python when I sent
	// it csharp code blocks.
	const removeLanguageAnnotations = function(query) {
		let lines = query.split("\n");
		let annotatedQuery = [];
		for (const line of lines) {
			if (line.startsWith("```")) {
				annotatedQuery.push("```");
			} else {
				annotatedQuery.push(line);
			}
		}
		return annotatedQuery.join("\n");
	}

	var current_programming_language = "";

	// Register a custom action that will either execute the current cell or
	// pop an alert (simulate send to GPT)
	var send_to_chatgpt = function() {
		var cell = Jupyter.notebook.get_selected_cell();
		if (cell.cell_type == 'markdown') {
			question = cell.get_text();
			
			if (question.startsWith('##### chat')) {
				// Use only the query in the current cell to detect the
				// current programming language
				current_programming_language = detect_programming_language(question);

				// Get the context from all relevant previous cells and send
				// that as the query to ChatGPT
				query = removeLanguageAnnotations(get_previous_cells());
				console.log(`Send to ChatGPT ${query}`);

				// TODO: what does * mean and implications for the timeout?
				window.postMessage({type: "QUERY_CHATGPT", text: query}, "*");
			}
			cell.render();
		} else if (cell.cell_type == 'code') {
			// Perform the default SHIFT+ENTER behavior which is execute
			// current code cell and move to next cell.
			cell.execute();
			Jupyter.notebook.select_next();
	 	} else {
			// Not sure if this ever gets hit
			console.log("No selected cell");
		}
	};

	// Generated by ChatGPT in Jupyter :)
	var formatDate = function() {
		var now = new Date();
		var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
		var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
		var suffix = (time[0] < 12) ? "AM" : "PM";
		time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
		time[0] = time[0] || 12;

		// If seconds and minutes are less than 10, add a zero
		for (var i = 1; i < 3; i++) {
			if (time[i] < 10) {
				time[i] = "0" + time[i];
			}
		}

		return date.join("/") + " " + time.join(":") + " " + suffix;
	}

	// Listen for post messages coming from the content script
	// There is a BEGIN message that signfies the start of a response
	// There is a stream of STREAM messages that contain the incremental response
	// There is an END message that signifies the end of the response
	const waiting_msg = "##### response: waiting for ChatGPT to respond...";

	var start_time = new Date();

	window.addEventListener("message", function(event) {
		if (event.data.type && (event.data.type == "BEGIN_CONTENT_SCRIPT")) {

			// Create a new markdown cell below the query to store the
			// result that is streamed back from ChatGPT.
			Jupyter.notebook.insert_cell_below();
			Jupyter.notebook.select_next();
			Jupyter.notebook.cells_to_markdown();

			// Start timer
			start_time = new Date();

			// Insert something into the cell to say we're starting now.
			Jupyter.notebook.get_selected_cell().set_text(waiting_msg);

		} else if (event.data.type && (event.data.type == "STREAM_CONTENT_SCRIPT")) {

			// This gets called when there is new content from ChatGPT. 
			// All the previous content is replaced with the new content.
			var response = event.data.text;
			var current_time = new Date();
			var time_difference = current_time - start_time;
			var seconds = Math.floor(time_difference / 1000) % 60;

			// Prepend the ChatGPT response with the time elapsed
			var msg = `##### response: ${seconds} seconds elapsed\n\n${response}`;
			Jupyter.notebook.get_selected_cell().set_text(msg);

		} else if (event.data.type && (event.data.type == "END_CONTENT_SCRIPT")) {

			// Get the complete response from ChatGPT from the cell
			let cell = Jupyter.notebook.get_selected_cell();
			let text = cell.get_text();
			text = text.replace(/^\#\#\#\#\# response.*\n/, "");

			// Use the detected programming language in the query to annotate
			// the markdown code blocks to ensure we syntax highlight
			// correctly.
			const [annotatedResponse, codeBlocks] = extract_code_blocks(current_programming_language, text);

			// Replace the elapsed time message with a timestamp message that
			// tells the user when the response was generated.
			var summary = `##### response generated by ChatGPT at ${formatDate(start_time)}\n`;
			cell.set_text(summary + annotatedResponse);
			cell.render();

			// Now inject the parsed code blocks into the notebook after
			// the response markdown cell.
			for (var i = 0; i < codeBlocks.length; i++) {
				Jupyter.notebook.insert_cell_below();
				Jupyter.notebook.select_next();
				Jupyter.notebook.get_selected_cell().set_text(codeBlocks[i]);
			}
		}
	});

	// TODO: figure out what real values to use for these
	var action = {
		icon: 'fa-comment', 
		help: 'Send to ChatGPT',
		help_index: 'zz',
		handler: send_to_chatgpt
	};
	var prefix = 'auto';
	var action_name = 'send-to-chatgpt';
	var full_action_name = Jupyter.actions.register(action, action_name, prefix); 

	// TODO: I don't really care about whether someone has overridden the shortcut
	// in another extension. Feel free to fix this!
	Jupyter.notebook.keyboard_manager.edit_shortcuts.add_shortcut('shift-enter', full_action_name);

	// Log that we successfully initialized the extension
	console.log('Im in yr page, injecting scripts');
})();