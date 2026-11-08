# ChatBot

A responsive AI chat assistant built with plain HTML, CSS and JavaScript. It has a landing page, registration and login, and a chat with saved conversation history. AI replies come from the Gemini API through a Netlify Function, so the API key is never exposed in the front-end code.

## Features

- Landing page with feature overview, FAQ and call-to-action
- Registration and login pages with form validation and a password strength meter
- Chat with conversation history: sidebar with search, reopen, delete and clear-all
- Image attachments (the model can answer questions about an image)
- Light and dark themes (the choice is remembered)
- Responsive layout: the history sidebar becomes a slide-in drawer on small screens
- Emoji picker, simple Markdown rendering (lists, code blocks, bold, links) and a copy button on answers

## Project structure

```
.
├── index.html            Landing page
├── pages/
│   ├── login.html
│   ├── register.html
│   └── chat.html
├── css/
│   ├── base.css          Shared design tokens, buttons, forms
│   ├── landing.css
│   ├── auth.css
│   └── chat.css
├── js/
│   ├── config.js         API settings (see "API setup")
│   ├── api.js            The only file that talks to the AI API
│   ├── auth.js           Registration / login (localStorage, demo)
│   ├── theme.js          Light / dark theme
│   ├── landing.js
│   ├── auth-pages.js
│   └── chat.js           Chat UI and history
├── assets/
│   └── logo.svg
└── netlify/functions/
    └── chat.js           Serverless function that calls Gemini (holds the API key)
```

## How data is stored (localStorage)

This project has no database. Accounts and chat history are stored in the browser's `localStorage`, so everything stays on the device and browser where it was created.

| Key | What it holds |
| --- | --- |
| `chatbot_users` | Registered accounts: name, email, a random salt and a password hash (PBKDF2, SHA-256) |
| `chatbot_session` | The signed-in user's email. Kept in `localStorage` with "Remember me", otherwise in `sessionStorage` (cleared when the tab closes) |
| `chatbot_history_<email>` | That user's conversations and messages |
| `chatbot_theme` | `light` or `dark` |

What this means in practice:

- **Not shared between devices or browsers.** An account created in Chrome on a computer does not exist in another browser, a different Chrome profile or on a phone. Logging in there shows "Incorrect email or password" until you register again, and the history will be separate.
- **Cleared with browser data.** Clearing site data, using a private window, or switching browsers means the accounts and chats are gone.
- **Size limit.** `localStorage` holds roughly 5 MB per site. Attached images are not saved in history (only a note that an image was attached), to avoid filling it up.
- **Not secure authentication.** Passwords are hashed, but anyone with access to the browser can read or edit the stored data, and there is no server to check logins. Treat this login as a demo and do not use real, sensitive passwords.
- **Nothing is sent to a server except your messages.** Chat messages go to the Netlify Function and on to the Gemini API to get a reply. Accounts and history are not uploaded anywhere.

To sync accounts and history across devices, replace `js/auth.js` and the history code in `js/chat.js` with a real backend (for example Supabase or Firebase), which provides server-side authentication and a database.

## API setup

The chat calls a Netlify Function, which forwards the request to Gemini. The key lives only on Netlify.

1. In `js/config.js`, set:
   ```js
   PROXY_URL: "/.netlify/functions/chat",
   ```
   Leave `API_KEY` empty.
2. In Netlify go to Site configuration → Environment variables and add your Gemini key under the exact name the function reads (for example `GEMINI_API_KEY`; check `netlify/functions/chat.js`).
3. The function must accept the JSON body `{ "contents": [...] }` and return the standard Gemini response (`candidates[0].content.parts[0].text`).
4. Make sure the function uses a current Gemini model name, for example `gemini-2.5-flash`.

Never commit an API key to the repository. To use a different AI provider later, change `js/api.js` and keep the same `ChatAPI.send(messages, file)` signature.

## Run locally

The Netlify Function only exists on Netlify, so use the Netlify CLI to run both the site and the function:

```bash
npm install -g netlify-cli
netlify dev
```

For `netlify dev`, put the key in a `.env` file in the project root (and add `.env` to `.gitignore`):

```
GEMINI_API_KEY=your-key-here
```

To look only at the pages (no AI replies), any static server works, for example `python -m http.server 8000`, then open http://localhost:8000.

## Deploy

1. Push the repository to GitHub.
2. In Netlify choose "Add new site" → "Import an existing project" and select the repository.
3. Add the environment variable from "API setup".
4. Netlify redeploys automatically on every push.

## Known limitations

- Accounts and history are per browser and device (see the localStorage section).
- Image attachments are not kept in history.
- There is no password reset, since there is no server.

## Possible next steps

- Server-side accounts and history (Supabase or Firebase) so the same login works everywhere
- Streaming responses
- Renaming conversations

## Author
- Javokhirbek Ruziboev
- email "roziboyevjavokhir045@gmail.com"