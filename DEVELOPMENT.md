# Initia Wallet Widget

## Setup

Clone the repository, install dependencies, and build the package:

```bash
git clone https://github.com/initia-labs/widget.git
cd widget
pnpm install
pnpm build:fast  # Build the package at least once before running in development mode.
```

Next, switch to the Vite example folder and configure your environment:

```bash
cd examples/vite
cp .env.development .env.development.local  # Toggle between mainnet and testnet in this file.
```

## Development Mode

Run the demo site directly from your local source with hot module replacement (HMR):

```bash
pnpm dev
```

- The widget source files will be injected into the portal element in the document body.
- The demo site will be available at: [http://localhost:5173](http://localhost:5173)

## Production Mode

After making changes to the widget package, rebuild and run the demo using the compiled output:

```bash
pnpm build  # Rebuild the package after any changes.
pnpm watch  # Serve the demo using the built widget and styles.
```

- In production mode, the widget and its styles will be injected into a Shadow DOM.
- The demo site will be available at: [http://localhost:5173](http://localhost:5173)
