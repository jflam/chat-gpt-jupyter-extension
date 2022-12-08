import Browser from "webextension-polyfill";

// It seems this script is triggered by the browser and executed top-down
// so the code at the bottom of this file executes first.

// The question parameter contains the query to send to ChatGPT. Now in the
// case of the Google extension it does the pretty simple thing of taking
// the query from Google. This is a search extension so presumably the run()
// function is explicitly called in this case. Now in the case of Jupyter
// extension some variant of this function will need to be passed the contents
// or extract the contents of a number of Jupyter cells so that the chat
// and code history can be accurately modeled and sent to ChatGPT.
// Code is quoted in this case using markdown ``` code ``` syntax.
async function run(question) {
  // Create a div container for the sidebar
  const container = document.createElement("div");
  container.className = "chat-gpt-container";

  // The CSS class .chat-gpt-container .loading uses CSS animation which pulses for a waiting spinner experience
  container.innerHTML = '<p class="loading">Waiting for ChatGPT response...</p>';

  // This uses a heuristic to find where to inject the new div. Worth noting
  // that the document object points to the current page in the browser. I 
  // will need to map against something interesting like localhost:8888 for 
  // the domain to activate this run() function in. Then the code below will
  // need to be modified to find the correct div to inject into within a Jupyter
  // notebook.
  const siderbarContainer = document.getElementById("rhs");
  if (siderbarContainer) {
    siderbarContainer.prepend(container);
  } else {
    container.classList.add("sidebar-free");
    document.getElementById("rcnt").appendChild(container);
  }

  // I don't understand what this runtime.connect() function does?
  const port = Browser.runtime.connect();
  port.onMessage.addListener(function (msg) {
    if (msg.answer) {
      // This erases the Waiting for ChatGPT response from the HTML and drops
      // the placeholder text for the response from ChatGPT
      container.innerHTML = '<p><span class="prefix">ChatGPT:</span><pre></pre></p>';

      // What type is msg.answer?
      container.querySelector("pre").textContent = msg.answer;
    } else if (msg.error === "UNAUTHORIZED") {
      // Note that this extension explicitly looks for an explicit error
      // message coming back from the service - this will force the user
      // to log into ChatGPT first.
      container.innerHTML =
        '<p>Please login at <a href="https://chat.openai.com" target="_blank">chat.openai.com</a> first</p>';
    } else {
      container.innerHTML = "<p>Failed to load response from ChatGPT</p>";
    }
  });
  port.postMessage({ question });
}

// This is code that initializes the extension. It is called by the browser.
// This looks for the search query in the Google sarch page which has 
// name="q" in the input HTML element. searchInput will contain the user
// query.

// In the case of the Jupyter extension, I think that what will need to happen
// is that something will trigger the extension to do something from within
// the browser. I wonder how that works? But given the trigger that runs here
// we will need to reach back into the page to find the cell that the user
// triggered the action from and then extract its contents (and any previous cells)
// going back until we reach the 8192 token limit for ChatGPT. We will then
// concatenate all of that stuff and send it to ChatGPT.

// Some notes about Jupyter structure - there is a selected class on the
// div element that contains the current selected cell. I can look for that.
// But I need a way to easily extract the code from the cell though. That
// doesn't look easy.

// I think I will need to inject JS into the Jupyter web page from the
// extension to pull this off.


const searchInput = document.getElementsByName("q")[0];
if (searchInput && searchInput.value) {
  // only run on first page
  const startParam = new URL(location.href).searchParams.get("start") || "0";
  if (startParam === "0") {
    // This is where the run() function is called with the user query
    run(searchInput.value);
  }
}

// Listen for post messages coming from the injected script
window.addEventListener("message", function(event) {
  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    question = event.data.text;
    console.log(`Code received from injected script: ${question}`);

    const port = Browser.runtime.connect();
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

// What is this doing? Can I pass a parameter?
s.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
