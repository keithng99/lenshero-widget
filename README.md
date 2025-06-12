# LensHero Widget

A Vue.js widget for prescription lens ordering that can be embedded in any website.

## Features

- Prescription image upload
- Lens features selection
- Responsive design
- Easy integration
- Development and production modes

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

### Development Mode

Run `npm run dev` and open `http://localhost:5173` to see the full app with the widget.

### Widget Mode

1. Build the project:

```bash
npm run build
```

2. Include the built files in your HTML:

```html
<div id="lenshero-widget"></div>
<script type="module" src="/path/to/dist/assets/index.js"></script>
```

## Project Structure

```
src/
├── components/
│   ├── LensheroWidget.vue    # Main widget component
│   ├── LensheroModal.vue     # Modal component
│   ├── SupportSection.vue    # Support section component
│   └── PoweredBySection.vue  # Powered by section component
├── App.vue                   # Development app
├── main.js                   # Entry point
└── style.css                 # Global styles
```

## License

MIT

aws cloudfront create-invalidation --distribution-id E16O7OKA9GSAIU --paths "/script.js" "/style.css"
