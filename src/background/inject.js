// This code will be injected by creating an element on the page and 
// injecting a script element onto the page so that I can access the
// existing loaded CodeMirror library that is in the page.

(function() {

	// Do all of this only if we detect that this is a Jupyter page
	var e = document.getElementsByClassName('selected');
	if (e != null) {
		for (let i = 0; i < e.length; i++) {
			// find the descendent element that has classname "CodeMirror"
			editor = e[i].querySelector(".CodeMirror-code");
			if (editor != null) {
				console.log(e[i].className)
				console.log(editor.className)
				console.log(editor.innerText)
			}
		}
	}

	alert('inserted self... giggity');
})();