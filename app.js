const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const db = require("better-sqlite3")("database.db")

const app = express();




app.listen("3000", () => {
    console.log("Server listening at http://localhost:3000!")
})

