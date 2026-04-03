# Presently Journal Reader

This workspace now contains a small web app for turning Presently CSV exports into a book-style PDF.

## How it works

The app treats each row starting with a date like `YYYY-MM-DD` as the start of a new entry. Everything after that date belongs to the entry until the next dated line.

## Run it

Open `index.html` directly in a browser, or serve the folder locally with a simple static server such as `python -m http.server 8000` and then open `http://localhost:8000`.

## Files

- `index.html` is the app shell.
- `styles.css` contains the UI.
- `app.js` contains the entry reader and PDF generator.
