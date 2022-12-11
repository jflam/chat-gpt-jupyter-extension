# ChatGPT for Jupyter

A browser extension that brings ChatGPT into your Jupyter notebooks. The way
I always describe Jupyter to my friends is that *it's a tool that handles
the mundane task of writing things down for you*. When I saw ChatGPT last 
week, I realized that there was no better home for ChatGPT than inside my
Jupyter notebooks.

TODO: add an animated gif to the repo.

## Installation

### Local Install for Chrome/Edge

1. Download `build.zip` from [Releases](https://github.com/jflam/chat-gpt-jupyter-extension/releases)
2. Unzip the file
3. In Chrome/Edge go to the extensions page (`chrome://extensions` or `edge://extensions`).
4. Enable Developer Mode.
5. Drag the unzipped folder anywhere on the page to import it (do not delete the folder afterwards).

### Build from source for Chrome/Edge

1. Clone the repo
2. Install dependencies with `npm`
3. Run `./build.sh` for Chrome.
4. Load the `build` directory to your browser

## Why a browser extension?
At the time that I created this project, ChatGPT was released as a technology
preview. That meant no public API.

One of the cool things that you can do with a browser extension is make 
cross-origin requests without being subject to the security constraints of
the browser. In effect, the browser extension runs in a privileged mode.

This lets me reuse the bearer token that is obtained by authenticating with
OpenAI. As long as the user can log into OpenAI through the official 
web site, this extension will be able to reuse that token to communicate
to the ChatGPT service from Jupyter.

The extension asks for permission to inject Javascript into `localhost` web
pages.

## Credit

This project is inspired by and forked from [Wang Dàpéng/chat-gpt-google-extension](https://github.com/wong2/chat-gpt-google-extension)
This project is inspired by [ZohaibAhmed/ChatGPT-Google](https://github.com/ZohaibAhmed/ChatGPT-Google)
