# Kas Knight Guardian - KKDAG Token Exchange

A decentralized React/TypeScript Web3 application for purchasing KKDAG tokens using the KCC20 SDK (Scorpion Wallet). This application seamlessly integrates with the Kaspa ecosystem, enabling users to swap KAS for KKDAG directly via smart contracts.

## Features

- **Decentralized Wallet Integration**: Connects with Scorpion Wallet (KCC20 SDK v170 natively supported).
- **KasWare Compatibility**: Optimized to handle KasWare chips for covenant transactions, bypassing locked UTXOs (KRC20 storage) dynamically.
- **True Spendable Balance Resolution**: Aggressively bypasses caches with a 3-tier balance fetch strategy:
  1. Live REST API fetch (primary).
  2. Native KasWare fallback.
  3. KCC20 SDK fallback.
- **Live Background Polling**: 3-second background polling keeps the UI perfectly synchronized if the user locks their wallet or changes accounts from the extension.
- **Cinematic Web3 UI**: Built with Tailwind CSS, featuring a "Professional Polish" elegant dark theme with glassmorphic cards, teal accents, and deep atmospheric glows.
- **Smart Error Handling**: Safely unpacks transaction rejections and cancellation states, converting them into user-friendly toast notifications via `sonner`.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Web3**: KCC20 SDK (injected)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A browser with the [Scorpion Wallet](https://scorpion.wallet/) / KasWare extension installed.

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

To build the app for production, run:

```bash
npm run build
```

This will generate the optimized static assets in the `dist` directory.

## Architecture Notes

- **SDK Injection**: The KCC20 SDK (`https://kcc-20-wallet.vercel.app/sdk.js?v=170`) is injected directly into `index.html`'s `<head>` to ensure it is initialized before React mounts.
- **Global Types**: Extended `Window` types for `kcc20` and `kasware` are defined in `src/kcc20.d.ts` without being explicitly imported into runtime files, preventing production bundler crashes.

## License

This project is licensed under the MIT License.
