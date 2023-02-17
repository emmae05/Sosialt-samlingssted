const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const db = require("better-sqlite3")("database.db")



const app = express();
const password = 'passord';
const saltRounds = 10;


bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        console.log(hash);
    });
});

//Åpner databasen
function connectToDb() {
  db = sqlite3.Database('./sosialt-samlingssted.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the users datanase');
});
}


//Oppretter og lagrer den nye brukeren
function createUser (brukernavn, passord) {
    //passord hash
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return console.error(err);
        }



        //brukernavn og passord lagres i databasen
        const sql = `INSERT INTO users (brukernavn, passord)
        VALUES (?, ?)`;
        db.run(sql, [brukernavn, hash], (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Brukeren ${brukernavn} ble opprettet!`);
        });
    });
}




app.listen("3000", () => {
    console.log("Server listening at http://localhost:3000")
})