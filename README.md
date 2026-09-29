# Noted. | MERN Notes App

A focused, full-stack notebook for capturing ideas and keeping important notes within reach. Create notes, pin the ones you want at the top, and keep everything backed by MongoDB.

![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-333333?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)

## Explore

- [Features](#features)
- [Getting started](#getting-started)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Screenshot](#screenshot)
- [Contributing](#contributing)

## Features

- **Write notes:** Save a title and content to your notebook.
- **Pin what matters:** Use the pin control on a note to move it into the **Pinned** section above all other notes. Pin state is saved in MongoDB.
- **Track completion:** Mark notes complete or incomplete; completed notes are highlighted in green for the current session.
- **Private accounts:** Register or sign in to access notes associated with your account.
- **Delete notes:** Remove a note from its card when it is no longer needed.
- **Responsive workspace:** Add and browse notes on desktop or mobile.
- **REST API:** React communicates with an Express API backed by MongoDB and Mongoose.

<details>
<summary>How pinning works</summary>

Each note has a `pinned` boolean. Select **Pin** to save it as pinned; select **Pinned** to return it to **All notes**. Refreshing the page keeps the selection.

</details>

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Axios, CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |

## Getting started

### Prerequisites

- Node.js and npm
- MongoDB running locally, or a MongoDB connection string

### 1. Configure the backend

```bash
cd backend
npm install
```

Create `backend/.env` with your MongoDB connection string:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/notes_app
JWT_SECRET=replace-this-with-a-long-random-secret
```

Use a unique, long random value for `JWT_SECRET`; do not commit the `.env` file.

Start the API:

```bash
npx nodemon server.js
```

The API listens at `http://localhost:5000`.

### 2. Start the frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
npm start
```

The development app opens at `http://localhost:3000` and sends API requests to `http://localhost:5000`.

## API reference

Register or sign in to receive a bearer token. Send it as `Authorization: Bearer <token>` to every note endpoint. Notes are private to the account that created them.

| Method | Endpoint | Description | Request body |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account and sign in | `{ "email": "...", "password": "..." }` |
| `POST` | `/api/auth/login` | Sign in | `{ "email": "...", "password": "..." }` |

All note endpoints are under `/api/notes` and require authentication.

| Method | Endpoint | Description | Request body |
| --- | --- | --- | --- |
| `GET` | `/api/notes` | List saved notes | — |
| `POST` | `/api/notes` | Create a note | `{ "title": "...", "content": "..." }` |
| `PATCH` | `/api/notes/:id/pin` | Update a note's pinned state | `{ "pinned": true }` |
| `PATCH` | `/api/notes/:id/complete` | Update a note's completion state | `{ "completed": true }` |
| `DELETE` | `/api/notes/:id` | Delete a note owned by the signed-in account | — |

Notes include `title`, `content`, `pinned`, `completed`, the owning user, and Mongoose `createdAt` / `updatedAt` timestamps. New notes start unpinned and incomplete. Notes created before accounts were added have no owner and are not shown in user notebooks.

The completion button is a frontend-only visual toggle and does not save its state after reloading the page.

## Project structure

```text
Notes_App/
├── backend/
│   ├── middleware/requireAuth.js
│   ├── models/
│   │   ├── Note.js
│   │   └── User.js
│   └── routes/
│       ├── auth.js
│       └── notes.js
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── App.css
│       └── index.js
└── screenshot/
```

## Screenshot

![Notes app screenshot](./screenshot/Screenshot.png)

## Contributing

Contributions are welcome. Fork the repository, create a feature branch, make your changes, and open a pull request.

## Contact

[GitHub profile](https://github.com/devsamirmondalops)

