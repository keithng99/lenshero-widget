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

## Local Development with HTTPS

To run the application with HTTPS locally:

1. Generate SSL certificates by running:

   ```bash
   node scripts/generate-cert.js
   ```

   This will create a `certificates` directory with the necessary files.

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Access the application at `https://localhost:5173`

Note: You may need to accept the self-signed certificate warning in your browser the first time.
