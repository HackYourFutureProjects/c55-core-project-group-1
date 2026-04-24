# 🎬 Find My Film

A smart movie discovery app that helps you find the perfect film based on your preferences, genres, and AI‑powered suggestions.

## 📝 Developer Notes

* Backend entrypoint: `src/backend/server.js`
* API + DB access helpers: `src/backend/movieApi.js` and `src/backend/db.js`
* Main UI logic: `frontend/script.js`
* Preferences flow: `src/backend/routes/preferences.js` and `frontend/script.js`

---

## 🚀 Overview

Find My Film is a full‑stack movie recommendation platform built with:

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express
* **Database:** SQLite
* **AI Integration:** LLM‑powered movie suggestions
* **Testing:** Vitest

Users can explore genres, search movies, get AI recommendations, and manage a personal watchlist.

---

## ✨ Features

### 🎯 Movie Recommendations
* Get personalized movie suggestions using AI
* Combine LLM + TMDB API for richer results
* Search by genre, year, actor, title, or rating

### ⭐ Watchlist
* Add movies to your watchlist
* View and manage saved movies
* Prevent duplicates with database constraints

### 🧠 AI Suggestion Tool
* Describe a movie you want
* AI returns 5 tailored recommendations
* Clean UI for browsing results

### 🗂️ Preferences
* Choose your favorite genres
* Future‑ready for user profiles

---

## 🏗️ Project Structure

```text
project/
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── src/backend/
│   ├── server.js
│   ├── db.js
│   ├── movieApi.js
│   ├── llm.js
│   ├── routes/
│   │   ├── llmRoutes.js
│   │   ├── movies.js
│   │   └── watchlist.js
│   └── database/
│       ├── movies_recommendation.db
│       └── setup.sql
│
├── tests/
│   └── watchlist.test.js
│
├── package.json
└── README.md
```

---

## ▶️ Running the Project

### 🌐 Live Demo
Try it instantly — no setup required:
👉 [find-my-film.onrender.com](https://find-my-film.onrender.com/)

---

### 💻 Run Locally

**1. Install dependencies**

```bash
npm install
```

**2. Start the backend**

```bash
npm start
```

**3. Open the frontend**

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database

SQLite database is stored in:

```
src/backend/database/movies_recommendation.db
```

Tables include:

* `watchlist`
* `preferences`
* `users` (future)

Setup SQL is located in `setup.sql`.

---

## 🧰 Technologies Used

| Layer    | Tech                   |
|----------|------------------------|
| Frontend | HTML, CSS, JavaScript  |
| Backend  | Node.js, Express       |
| Database | SQLite                 |
| AI       | LLM (via API)          |
| Testing  | Vitest                 |
| Tools    | Prettier, ESLint       |

---

## 🧪 Testing

This project uses **Vitest** for unit testing.

Run all tests:

```bash
npm test
```

Watchlist routes are fully covered with mock database tests.