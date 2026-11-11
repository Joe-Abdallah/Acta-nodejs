-- ============================================================
-- PostgreSQL Schema
-- ============================================================

-- Clients (users)
CREATE TABLE IF NOT EXISTS clients (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Communities
CREATE TABLE IF NOT EXISTS communities (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    creator_id  BIGINT       NOT NULL REFERENCES clients(id) ON DELETE CASCADE
);

-- Community membership (join table)
CREATE TABLE IF NOT EXISTS community_members (
    community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    client_id    BIGINT NOT NULL REFERENCES clients(id)    ON DELETE CASCADE,
    PRIMARY KEY (community_id, client_id)
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(300) NOT NULL,
    content       TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    vote_count    INTEGER      NOT NULL DEFAULT 0,
    comment_count INTEGER      NOT NULL DEFAULT 0,
    client_id     BIGINT       NOT NULL REFERENCES clients(id)     ON DELETE CASCADE,
    community_id  BIGINT       NOT NULL REFERENCES communities(id) ON DELETE CASCADE
);

-- Comments (self-referential for nested replies)
CREATE TABLE IF NOT EXISTS comments (
    id                BIGSERIAL PRIMARY KEY,
    content           TEXT        NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    vote_count        INTEGER     NOT NULL DEFAULT 0,
    client_id         BIGINT      NOT NULL REFERENCES clients(id)  ON DELETE CASCADE,
    post_id           BIGINT      NOT NULL REFERENCES posts(id)    ON DELETE CASCADE,
    parent_comment_id BIGINT               REFERENCES comments(id) ON DELETE CASCADE
);

-- Post votes
CREATE TABLE IF NOT EXISTS post_votes (
    id         BIGSERIAL PRIMARY KEY,
    vote_type  VARCHAR(10) NOT NULL CHECK (vote_type IN ('UPVOTE', 'DOWNVOTE')),
    client_id  BIGINT      NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    post_id    BIGINT      NOT NULL REFERENCES posts(id)   ON DELETE CASCADE,
    UNIQUE (client_id, post_id)
);

-- Comment votes
CREATE TABLE IF NOT EXISTS comment_votes (
    id         BIGSERIAL PRIMARY KEY,
    vote_type  VARCHAR(10) NOT NULL CHECK (vote_type IN ('UPVOTE', 'DOWNVOTE')),
    client_id  BIGINT      NOT NULL REFERENCES clients(id)   ON DELETE CASCADE,
    comment_id BIGINT      NOT NULL REFERENCES comments(id)  ON DELETE CASCADE,
    UNIQUE (client_id, comment_id)
);
