// This is the content script file that is injected into the page. However,
// I need to inject the background/inject.js file into the page so that I
// can access the Jupyter page code. This is done by creating a script
// element and injecting it into the page.

// Listen for post messages coming from the injected script
window.addEventListener("message", function(event) {
  if (event.data.type && (event.data.type === "QUERY_CHATGPT")) {
    let query = event.data.query;
    let language = event.data.language;
    let thread = event.data.thread;

    console.log("Sending the following query and context to ChatGPT");
    console.log("query", query);
    console.log("language", language);
    console.log("thread", thread);

    // Register a callback for intermediate messages coming from the
    // background script.
    const port = chrome.runtime.connect();
    port.onMessage.addListener(function (msg) {
      if (msg.answer) {
        window.postMessage({ 
          type: "STREAM_CONTENT_SCRIPT", 
          text: msg.answer 
        }, "*");
      } else if (msg.end) {
        window.postMessage({ 
          type: "END_CONTENT_SCRIPT",
          language: language, 
          thread: thread
        }, "*");
      } else if (msg.error === "UNAUTHORIZED") {
        window.postMessage({
          type: "ERROR_LOGIN_CONTENT_SCRIPT"
        }, "*");
        console.log("Please login at https://chat.openai.com first");
      } else {
        console.log("Failed to load response from ChatGPT");
      }
    });

    // Tell the injected script that the query has been sent to ChatGPT
    this.window.postMessage({ type: "BEGIN_CONTENT_SCRIPT" }, "*");

    // Send the query to the background script
    port.postMessage({ query });
  }
});

// All page scripts should be loaded now, so now we inject the script
// into the page
var s = document.createElement('script');
s.src = chrome.runtime.getURL("content-script/inject.js");
console.log("Injecting script element into page");
s.onload = function () {
  this.remove();
  console.log("Removing script element from page");
};
(document.head || document.documentElement).appendChild(s);