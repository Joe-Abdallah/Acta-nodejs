# Acta API

A REST API built with Node.js, Express, and PostgreSQL that has the core functionalities of: users, communities, posts, comments, nested replies, and upvote/downvote voting.

It has two interfaces on top of the same service layer:
 
- a **REST API** (`/api/v1/...`), secured with JWT, and
- a **server-rendered web UI** built with **EJS** (`/`, `/clients`, `/communities`, `/posts`).

---

## Table of Contents

- [Project Setup](#project-setup)
- [Running the Application](#running-the-application)
- [Web UI (EJS)](#web-ui-ejs)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Third-Party Libraries](#third-party-libraries)
- [Testing with Postman](#testing-with-postman)

---

## Project Setup

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- [Postman](https://www.postman.com/) (for testing)

---

### 1. Install Dependencies

```bash
npm install
```

---

### 2. Create the Database

Open pgAdmin and create a new database:

```sql
CREATE DATABASE web_project;
```

Then connect to it and run the schema file to create all tables:

```sql
-- In pgAdmin: connect to web_project, open Query Tool, paste and run schema.sql
```

---

### 3. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3000

PG_USER=postgres
PG_PASS=yourpassword
PG_HOST=localhost
PG_PORT=port
PG_DATABASE=db_name
AUTH_SECRET=change-me-to-a-long-random-string
```

---

## Running the Application

```bash
npm run dev
```

The server will start at `http://localhost:3000`.

---

## Web UI (EJS)
 
In addition to the API, the app serves server-rendered pages built with [EJS](https://ejs.co/). They use the same services and database as the API, so data created in one place shows up in the other.
 
| Page | URL | What you can do |
|------|-----|-----------------|
| Dashboard | `/` | See live counts of clients, communities, posts and comments |
| Clients | `/clients` | View all users and register a new one |
| Communities | `/communities` | View communities, create one, and join a community |
| Posts | `/posts` | View posts, create a post, upvote and downvote |
| Comments | `/posts/:postId/comments` | View a post's comments, add a comment or reply, upvote and downvote |
 
Forms submit with standard `POST` requests and redirect back to the page with a success or error message.
 
Open `http://localhost:3000` in your browser after starting the server.
 
> Note: The web UI is a simple demo front end and has no login. See [Known Limitations](#known-limitations).
 
---


## API Endpoints

All protected routes require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <your_token>
```

---

### Auth

- POST `/api/v1/auth/register` - Register a new account
- POST `/api/v1/auth/login` - Login and receive a JWT token

**Register body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Login body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Login response:**
```json
{
  "token": "eyJ...",
  "client": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/clients`  | Get all clients |
| GET | `/api/v1/clients/:id`  | Get a client by ID |
| PUT | `/api/v1/clients/:id`  | Update your own account |
| DELETE | `/api/v1/clients/:id`  | Delete your own account |

**Update body:**
```json
{
  "username": "new_username",
  "email": "new_email@example.com"
}
```

> Note: You can only update or delete your own account. Attempting to modify another user's account returns `403 Forbidden`.

---

### Communities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/communities`  | Get all communities |
| GET | `/api/v1/communities/me`  | Get communities you have joined |
| GET | `/api/v1/communities/:id`  | Get a community by ID |
| POST | `/api/v1/communities`  | Create a new community |
| PUT | `/api/v1/communities/:id`  | Update your community |
| DELETE | `/api/v1/communities/:id`  | Delete your community |
| POST | `/api/v1/communities/:id/join`  | Join a community |
| DELETE | `/api/v1/communities/:id/leave`  | Leave a community |

**Create / Update body:**
```json
{
  "name": "programming",
  "description": "A community for programmers"
}
```

> Note: The creator is automatically joined as the first member on creation. Only the creator can update or delete their community.

---

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/posts`  | Get all posts |
| GET | `/api/v1/posts/me`  | Get your own posts |
| GET | `/api/v1/posts/:id`  | Get a post by ID |
| GET | `/api/v1/posts/community/:communityId`  | Get all posts in a community |
| POST | `/api/v1/posts`  | Create a new post |
| PUT | `/api/v1/posts/:id`  | Update your post |
| DELETE | `/api/v1/posts/:id` | Delete your post |

**Create body:**
```json
{
  "title": "My first post",
  "content": "This is the body of my post",
  "communityId": 1
}
```

**Update body:**
```json
{
  "title": "Updated title",
  "content": "Updated content"
}
```

> Note: You must be a member of the community to create a post in it.

---

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/comments/post/:postId` | Get all comments on a post |
| GET | `/api/v1/comments/:id` | Get a comment by ID |
| GET | `/api/v1/comments/:id/replies`  | Get all replies to a comment |
| POST | `/api/v1/comments`  | Create a comment or reply |
| PUT | `/api/v1/comments/:id` | Update your comment |
| DELETE | `/api/v1/comments/:id` | Delete your comment |

**Create a top-level comment:**
```json
{
  "content": "This is a comment",
  "postId": 1
}
```

**Create a reply to a comment:**
```json
{
  "content": "This is a reply",
  "postId": 1,
  "parentCommentId": 1
}
```

**Update body:**
```json
{
  "content": "Updated comment content"
}
```

> Note: Deleting a comment automatically deletes all its nested replies.

---

### Votes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/votes/posts/:postId`| Vote on a post |
| POST | `/api/v1/votes/comments/:commentId`| Vote on a comment |

**Vote body:**
```json
{
  "voteType": "UPVOTE"
}
```
or
```json
{
  "voteType": "DOWNVOTE"
}
```

**Vote response examples:**
```json
{ "action": "voted",    "voteType": "UPVOTE" }   // first time voting
{ "action": "unvoted"                          }   // same vote again (toggles off)
{ "action": "switched", "voteType": "DOWNVOTE" }   // changed vote direction
```

> Note: Sending the same `voteType` twice removes the vote (toggle). Sending the opposite `voteType` switches it and adjusts the count by ±2.

---

## Database Schema

The database has 6 tables:

### `clients`
Stores registered users.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key, auto-generated |
| username | VARCHAR(50) | Unique display name |
| email | VARCHAR(255) | Unique email address |
| password | VARCHAR(255) | Bcrypt-hashed password |
| created_at | TIMESTAMPTZ | Account creation timestamp |

---

### `communities`
Stores communities.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| name | VARCHAR(100) | Unique community name |
| description | TEXT | Optional description |
| created_at | TIMESTAMPTZ | Creation timestamp |
| creator_id | BIGINT | FK → clients(id), CASCADE DELETE |

---

### `community_members`
Join table for the many-to-many relationship between clients and communities.

| Column | Type | Description |
|--------|------|-------------|
| community_id | BIGINT | FK → communities(id), CASCADE DELETE |
| client_id | BIGINT | FK → clients(id), CASCADE DELETE |

Primary key is the combination of both columns.

---

### `posts`
Stores posts submitted to communities.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| title | VARCHAR(300) | Post headline |
| content | TEXT | Optional post body |
| created_at | TIMESTAMPTZ | Creation timestamp |
| vote_count | INTEGER | Cached net vote count (upvotes − downvotes) |
| comment_count | INTEGER | Cached total comment count |
| client_id | BIGINT | FK → clients(id), CASCADE DELETE |
| community_id | BIGINT | FK → communities(id), CASCADE DELETE |

---

### `comments`
Stores comments and nested replies on posts.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| content | TEXT | Comment text |
| created_at | TIMESTAMPTZ | Creation timestamp |
| vote_count | INTEGER | Cached net vote count |
| client_id | BIGINT | FK → clients(id), CASCADE DELETE |
| post_id | BIGINT | FK → posts(id), CASCADE DELETE |
| parent_comment_id | BIGINT | FK → comments(id), NULL = top-level, CASCADE DELETE |

---

### `post_votes`
Stores votes cast on posts. One vote per client per post.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| vote_type | VARCHAR(10) | Either `UPVOTE` or `DOWNVOTE` |
| client_id | BIGINT | FK → clients(id), CASCADE DELETE |
| post_id | BIGINT | FK → posts(id), CASCADE DELETE |

Unique constraint on `(client_id, post_id)`.

---

### `comment_votes`
Stores votes cast on comments. One vote per client per comment.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| vote_type | VARCHAR(10) | Either `UPVOTE` or `DOWNVOTE` |
| client_id | BIGINT | FK → clients(id), CASCADE DELETE |
| comment_id | BIGINT | FK → comments(id), CASCADE DELETE |

Unique constraint on `(client_id, comment_id)`.

---

## Third-Party Libraries

| Library | Purpose |
|---------|---------|
| [express](https://expressjs.com/) | Web framework for routing and middleware |
| [ejs](https://ejs.co/) | Templating engine for the server-rendered web UI |
| [pg](https://node-postgres.com/) | PostgreSQL client for Node.js |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing  |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT generation and verification for authentication |
| [express-validator](https://express-validator.github.io/) | Request body validation middleware |
| [dotenv](https://github.com/motdotla/dotenv) | Loads environment variables from `.env` file |
| [nodemon](https://nodemon.io/) | Dev tool — auto-restarts server on file changes |

---

## Testing with Postman

### Step 1 — Register and Get a Token

1. Open the **Auth** folder
2. Click **Register** and hit **Send**
3. You will get back a response with a `token` field — copy the token value
4. Click **Login** and hit **Send** if you want to log in with an existing account instead

---

### Step 2 — Set the Token Variable

1. Click on the collection name
2. Go to the **Authorization** tab
3. Paste your token 

Every protected request already has `Authorization: Bearer {{token}}` configured — they will all use your token automatically.

---

### Step 3 — Test the Endpoints in Order

Since data depends on each other, follow this order:

1. **Register** → creates your account
2. **Login** → copy the token → paste into collection variable
3. **Create Community** → note the `id` in the response
4. **Create Post** → replace `communityId` in the body with your community's `id`
5. **Create Comment** → replace `postId` in the body with your post's `id`
6. **Create Reply** → use the comment's `id` as `parentCommentId`
7. **Vote on Post** → replace `1` in the URL with your post's `id`
8. **Vote on Comment** → replace `1` in the URL with your comment's `id`

> For any route with `:id`, `:postId`, `:communityId`, or `:commentId` in the URL, replace the `1` placeholder in Postman with the actual ID from your previous responses.

## Known Limitations

- **The EJS web UI has no login.** The JSON API is protected with JWT; the web UI is meant as a simple demo front end.
