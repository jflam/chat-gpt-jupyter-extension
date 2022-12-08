// This is the content script file that is injected into the page. However,
// I need to inject the background/inject.js file into the page so that I
// can access the Jupyter page code. This is done by creating a script
// element and injecting it into the page.

// Listen for post messages coming from the injected script
window.addEventListener("message", function(event) {
  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    question = event.data.text;
    console.log(`Code received from injected script: ${question}`);

    const port = chrome.runtime.connect();
    port.onMessage.addListener(function (msg) {
      if (msg.answer) {
        window.postMessage({ type: "STREAM_CONTENT_SCRIPT", text: msg.answer }, "*");
      } else if (msg.end) {
        window.postMessage({ type: "END_CONTENT_SCRIPT" }, "*");
      } else if (msg.error === "UNAUTHORIZED") {
        console.log("Please login at https://chat.openai.com first");
      } else {
        console.log("Failed to load response from ChatGPT");
      }
    });
    // Tell begin
    this.window.postMessage({ type: "BEGIN_CONTENT_SCRIPT" }, "*");
    port.postMessage({ question });
  }
});

// Magical inject a script element into the DOM page code from 
// https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-using-a-content-script
var s = document.createElement('script');
s.src = chrome.runtime.getURL("background/inject.js");
s.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
