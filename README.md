# Crypto Bonuses

A modern web application for discovering and comparing cryptocurrency casino bonuses. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Browse and search through various cryptocurrency casino bonuses
- Filter bonuses by type (deposit, free, free spins, etc.)
- Sort bonuses by value or alphabetically
- Copy promo codes with one click
- Responsive design for all devices
- Modern UI with smooth animations
- Admin panel for managing casinos and bonuses
- Persistent image storage with Railway Volume

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React
- ESLint

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cryptobonuses.git
cd cryptobonuses
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Image Storage

Images uploaded via the admin UI are stored on the mounted Volume at `/data/uploads`, so they survive redeploys on Railway.

### Environment Variables

- `UPLOAD_DIR`: Directory for storing uploaded files (defaults to `/data/uploads`)
- `NEXT_PUBLIC_BASE_URL`: Base URL for generating public file URLs

### Upload Features

- **Persistent Storage**: Files are stored on Railway's mounted volume at `/data/uploads`
- **SEO-Friendly Filenames**: Automatic generation of descriptive filenames based on context
- **File Validation**: Type and size validation for uploaded images (JPEG, PNG, WebP, GIF up to 10MB)
- **Security**: Directory traversal protection and access controls
- **Performance**: Optimized file serving with proper caching headers
- **Public Access**: Files accessible via `/uploads/<filename>` URL pattern

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── layout.tsx    # Root layout component
│   ├── page.tsx      # Home page component
│   └── globals.css   # Global styles
├── components/       # React components
│   ├── CasinoCard.tsx
│   └── FilterControls.tsx
├── data/            # Data files
│   └── casinoBonuses.ts
└── types/           # TypeScript type definitions
    └── casino.ts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 