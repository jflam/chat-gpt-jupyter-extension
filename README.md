# ChatGPT for Jupyter

A browser extension that brings ChatGPT into your Jupyter notebooks. The way
I always describe Jupyter to my friends is that *it's a tool that handles
the mundane task of writing things down for you*. When I saw ChatGPT last 
week, I realized that there was no better home for ChatGPT than inside my
Jupyter notebooks.

This GitHub repo is the culmination of some hacking in the evenings over the
past week. It builds on top of the excellent work by ZZZ. In fact this
repo is forked from his work, which also builds on top of the work by ZZZ.

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

TODO: add an animated gif to the repo.

## Installation

### Install to Chrome/Edge

#### Install from Chrome Web Store (Preferred)

I don't know how to do this yet. Working on it.

#### Local Install

I don't know how to do this either. Working on it.

1. Download `chrome.zip` from [Releases](https://github.com/jflam/chat-gpt-jupyter-extension/releases)
2. Unzip the file
3. In Chrome/Edge go to the extensions page (`chrome://extensions` or `edge://extensions`).
4. Enable Developer Mode.
5. Drag the unzipped folder anywhere on the page to import it (do not delete the folder afterwards).

### Install to Firefox

I'm not working on this right now. Everything I know about writing a 
browser extension is in this repo. I'm not a web dev. If a real web dev
wants to help get this running on Firefox, please go ahead and send me a PR!
#### Install from Mozilla Add-on Store (Preferred)

Hopefully someone will work on this.

#### Local Install

Hopefully someone will work on this.

## Build from source

This works today.

1. Clone the repo
2. Install dependencies with `npm`
3. Run `./build.sh` for Chrome.
4. Load the `build` directory to your browser

## Credit

This project is inspired by and forked from [Wang Dàpéng/chat-gpt-google-extension](https://github.com/wong2/chat-gpt-google-extension)
This project is inspired by [ZohaibAhmed/ChatGPT-Google](https://github.com/ZohaibAhmed/ChatGPT-Google)
