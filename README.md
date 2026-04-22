# 🎬 Find My Film


A smart movie discovery app that helps you find the perfect film based on your preferences, genres, and AI-powered suggestions.

---

## 📸 Screenshots

**Movie Dashboard**

![Dashboard](https://i.postimg.cc/hvC5QHDx/Screenshot-2026-04-22-at-12-32-02.png)


 
---

## ⚙️ Technical Highlights

![Technical Highlights](https://i.postimg.cc/KjF13Hqx/Screenshot-2026-04-22-at-12-39-12.png)


---

---

## 🚀 Overview

Find My Film is a full-stack movie recommendation platform built with a simple frontend and a Node/Express backend. It combines TMDb data with an LLM-powered suggestion layer and stores user watchlists and preferences in SQLite.

Users can browse and search movies, pick preferred genres, receive AI suggestions, and maintain a personal watchlist.

---

## ✨ Features

- AI-powered movie suggestions (LLM + TMDb)
- Search and filter by title, genre, year, actor, rating
- Persistent watchlist with duplicate prevention
- Preferences (favorite genres)
- Test coverage for key routes (Vitest)

---

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | SQLite |
| AI | LLM (via API) + TMDb |
| Testing | Vitest |

---

## 🏗️ Project Structure

```text
project/
# front-end
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── styles.css
# source
├── src/
│   ├── backend/
│   │   ├── routes/
│   │   │   ├── llmRoutes.js
│   │   │   ├── movies.js
│   │   │   └── watchlist.js
│   │   ├── utils/
│   │   │   └── genreMap.js
│   │   ├── db.js
│   │   ├── llm.js
│   │   ├── movieApi.js
│   │   └── server.js
│   └── database/
│       ├── movies_recommendation.db
│       └── setup.sql
# tests and misc
├── tests/
│   ├── example.test.js
│   ├── llmroutes.test.js
│   ├── movieroute.test.js
│   └── server.test.js
├── .env.example
├── package.json
└── README.md
```

---

## ▶️ Quick Start (Local)

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file (see `.env.example`) and set required API keys

3. Initialize the SQLite database (run once):

```bash
# from project root
sqlite3 src/backend/database/movies_recommendation.db < src/backend/database/setup.sql
```

4. Start the backend

```bash
npm start
```

5. Open the frontend in your browser:

http://localhost:3000

---

## 🔑 Environment

Create a `.env` file in the project root with the following values:

```env
# TMDb API key
TMDB_API_KEY=your_tmdb_api_key

# LLM/API key for suggestions
LLM_API_KEY=your_llm_api_key

# Port (optional)
PORT=3000
```

You can copy `.env.example` to `.env` and fill the values.

---

## 🗄️ Database

- The project uses SQLite. The database file is `src/backend/database/movies_recommendation.db`.
- Use `src/backend/database/setup.sql` to create required tables.
[Screenshot-2026-04-22-at-12-34-56.png](https://postimg.cc/hJ1kfrMC)

If you need to reset the DB locally, remove the `.db` file and re-run the `sqlite3` command above.

---

## 🧪 Tests

Run unit tests with:

```bash
npm test
```

---

## 👥 Contributors

<table>
  <tr>
    <td align="center">

## 👨‍💻 Team Contributions

### Dagim
**Group contributions (with Salem):**
- Worked together on the HTML structure
- Collaborated on the CSS styling for the frontend

**Individual contributions:**
- Set up the Express server
- Implemented the basic watchlist router
- Configured the GitHub Actions CI pipeline
- Organized the project folder structure
- Wrote and updated the README
- Created the `.env.example` file
- Added the initial test file

### Salem
**Group contributions (with Dagim):**
- Worked together on the HTML structure
- Collaborated on the CSS styling for the frontend

**Individual contributions:**
- Assisted with building the frontend interface
- Implemented several movie routes
- Fetched movie details using movie ID
- Added features to display movie information from IMDb
- Built frontend functionality for searching movies and actors
- Implemented the watchlist display feature
- Implemented the "Pick Genres" feature

### Atiqa
**Individual contributions:**
 Watchlist feature (end-to-end):
  - Created the `watchlist` table in `setup.sql`
  - Implemented watchlist functions in `db.js`
  - Implemented watchlist UI functionality

 LLM feature (end-to-end):
  - Developed `llm.js` for core LLM AI logic
  - Contributed to `movieApi.js` as TMDb wrapper
  - Implemented `routes/llmRoutes.js` endpoint handler
  - Updated `routes/movies.js` for movie display routes
  - Added UI logic for suggestions in `script.js`

**Group contributions (with Muna):**
- Planned the app and proposed the watchlist feature
- Resolved merge conflicts and reviewed PRs
- Collaborated on preferences and recommendation features
- Co-presented the project

### Muna
**Individual contributions:**
- Implemented all TMDb API functions in `movieApi.js` (search, filter, recommend)
- Organized API logic and data processing
- Built the preferences feature end-to-end
- Implemented UI logic in `script.js` to render and save preferences
- Created backend routes in `routes/preferences.js`
- Added CSS styling for the preferences form

**Group contributions (with Atiqa):**
- Set up `db.js` and the database structure together
- Built shared database functions
- Collaborated on preferences and recommendation features
- Helped resolve merge conflicts and reviewed PRs

      <img src="https://github.com/Dagim.png?size=200" width="100" alt="Dagim"/><br/>
      <sub><b>Dagim</b></sub><br/>
      🧑‍💻 Backend • README • CI
    </td>
    <td align="center">
      <img src="https://github.com/Salem.png?size=200" width="100" alt="Salem"/><br/>
      <sub><b>Salem</b></sub><br/>
      🎨 Frontend • Routes • Search
    </td>
    <td align="center">
      <img src="https://github.com/Atiqa.png?size=200" width="100" alt="Atiqa"/><br/>
      <sub><b>Atiqa</b></sub><br/>
      🤖 LLM • Watchlist • DB
    </td>
    <td align="center">
      <img src="https://github.com/Muna.png?size=200" width="100" alt="Muna"/><br/>
      <sub><b>Muna</b></sub><br/>
      🎬 TMDb API • Preferences
    </td>
  </tr>
</table>

---

## ✅ Notes & next steps

- This README has been cleaned: duplicate fragments and chat transcripts were removed.
- I can add CI/test badges, license text, or create a PR with this change if you want.

---

## License

This project is available under the MIT License.
