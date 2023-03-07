const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const db = require("better-sqlite3") ("app.db") 
const fileUpload = require('express-fileupload');

const app = express();





app.use(session({
    secret: "Enlangstring",
    resave: false,
    saveUninitialized: false 
}))


app.use(express.urlencoded({extended: true})) //data fra nettsiden blir sendt til serveren

app.use(fileUpload());
app.get("/registrer", (req, res) => {
    res.sendFile(path.join(__dirname, "/registrer.html"))
})

app.use(express.static(__dirname + '/Sosial-samlingssted'));


app.get("/", (req, res) => {
    if(req.session.loggedin) {
        res.sendFile(path.join(__dirname, "/forside.html"))
    } else{
        res.sendFile(path.join(__dirname, "/login.html"))
    }
})

app.post("/login", async (req, res) => {
    let login = req.body;

    let userData = db.prepare("SELECT * FROM user WHERE name = ?").get(login.name);

    if(await bcrypt.compare(login.password, userData.hash)) {
        console.log("Rett passord")
        req.session.loggedin = true
        res.sendFile(__dirname + "/forside.html")
    } else {
        console.log("Feil passord")
        res.redirect("back")
    }
})

app.post(("/addUser"), async (req, res) => {
    let svar = req.body;

    let hash = await bcrypt.hash(svar.password, 10)
    console.log(svar)
    console.log(hash)

    db.prepare("INSERT INTO user (name, email, hash) VALUES (?, ?, ?)").run(svar.name, svar.email, hash)

    res.redirect("back")
})


app.get("", (req, res) => {
    console.log(req,session)
    if (req.session.visits == undefined) {
        req,session,visits = 1
    } else {
        req.session.visits++
    }

    res.send("Antall besøkende: " + req.session.visits)
})


// rute for bilde


//tillate bare bilder opp til 10 MB
// app.use(
//     fileUpload({
//         limits: {
//             fileSize: 10000000, 
//         },
//         abortOnLimit: true, 
//     })
// );


app.get('/', (req, res) => {
    res.send('Hello World!');
});


//tillater BARE bilder til å bli opplastet 
app.post('/upload',  (req, res) => {
    const { image } = req.files;
    

    // if (!image) return res.sendStatus(400);

    // if (/^image/.test(image.mimetype)) return res.sendStatus(400);

    image.mv(__dirname + '/upload/' + image.name);

    res.sendStatus(200);
});

app.get("/lastopp", (req, res) => {
    res.sendFile(__dirname + "/image.html")
})



//



app.listen("3000", () => {
    console.log("Server listening at http://localhost:3000")
})