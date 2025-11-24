# Markdown Viewer via URL Query

This project loads and renders a Markdown file based on a URL provided as a query parameter.

## Usage

Pass a `url` parameter that points to any Markdown file you want to display.

The app will fetch the Markdown file from the given URL and render it on the page.

## Features

- Fetches remote Markdown files
- Renders Markdown in the browser
- Supports any publicly accessible `.md` file URL

## Development

1. Clone the repository.
2. Install dependencies:
```sh
npm install
```
3. Start the development server:
```sh
npm run dev
```
4. Open your browser and provide a `url` parameter to load a Markdown file.

## Notes

- Make sure the remote server hosting the `.md` file allows CORS.
- Use full URLs (including protocol).
