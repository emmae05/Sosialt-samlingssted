const db = require("better-sqlite3")("app.db")

db.exec(`
CREATE TABLE IF NOT EXISTS user(
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    hash TEXT
    )

`)