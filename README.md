# Brads Spelcafé Game Catalogue

A SvelteKit application for managing and displaying board game information for Brads Spelcafé.

## Features

- Browse a catalogue of board games
- Search functionality
- Admin panel for adding new games from BoardGameGeek
- Responsive design using Tailwind CSS

## Prerequisites

- Node.js (v14 or later)
- npm or yarn

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/brads-spelcafe-catalogue.git
   cd brads-spelcafe-catalogue
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up the database:

   ```bash
   npm run db:setup
   # or
   yarn db:setup
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production version of the app:

```bash
npm run build
# or
yarn build
```

You can preview the production build with:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

- `/src`: Source files
  - `/routes`: SvelteKit routes
  - `/lib`: Shared components and utilities
  - `/db`: Database related files
- `/static`: Static assets
- `/tests`: Test files

## Technologies Used

- [SvelteKit](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DrizzleORM](https://github.com/drizzle-team/drizzle-orm)
- [Better-SQLite3](https://github.com/JoshuaWise/better-sqlite3)

## API Endpoints

- `GET /api/games`: Fetch games with pagination and filtering
- `POST /api/games`: Add a new game to the database
- `GET /api/bgg-search`: Search BoardGameGeek for games

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
