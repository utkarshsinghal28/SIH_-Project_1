# Krishi Procurement Platform — Simple Website Version

**Smarter Procurement. Less Waiting.**

This branch is a simple remake of the project website using only basic web
languages:

- **HTML** — the pages
- **CSS** — the styling (`style.css`)
- **JavaScript** — form checking and login (`script.js`)

No frameworks, no backend, no build step. Just open the files in a browser.

> The full version of the project (React + Express + MongoDB) is on the
> `main` branch. This branch only has the website.

## Files

| File            | What it is                     |
| --------------- | ------------------------------ |
| `index.html`    | Home page                      |
| `login.html`    | Login form                     |
| `register.html` | Farmer registration form       |
| `style.css`     | All the styles                 |
| `script.js`     | All the JavaScript             |

## How to run

**Easy way:** double-click `index.html` to open it in your browser.

**Or** run a small local server from this folder:

```
python3 -m http.server 8000
```

then open http://localhost:8000 in your browser.

## What works

- **Home page** — project intro, the problem, and how it works.
- **Registration form** — full name, mobile number, email (optional),
  password, village, district and state, with proper checking
  (10-digit mobile number, password of 6+ characters, matching passwords,
  no duplicate mobile number/email).
- **Login form** — one box accepts a mobile number **or** an email,
  plus password. Wrong details show a clear error message.
- After login, the home page shows a welcome message with your account
  details, and the top bar shows your name with a **Logout** button.

## How login works (frontend only)

This version has no server or database, so accounts created from the
registration form are saved in the browser using `localStorage`.

That means:

- Registering logs you in straight away, and you stay logged in when you
  reopen the page (in the same browser).
- Accounts exist only in that one browser — this is fine for a demo or for
  learning, but a real app needs a backend to store accounts safely.

## Demo accounts (for testing)

| Who    | Mobile / Email        | Password    |
| ------ | --------------------- | ----------- |
| Farmer | `9876543210`          | `farmer123` |
| Farmer | `9812345678`          | `farmer123` |
| Admin  | `admin@krishi.gov.in` | `admin123`  |

You can also register your own account and then log in with it.
