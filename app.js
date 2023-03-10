const express = require("express"); //express blir importert
const session = require("express-session"); //sessions blir importert
const bcrypt = require("bcrypt"); //bcrypt blir importert
const path = require("path"); //path blir importert
const db = require("better-sqlite3") ("app.db") //db min fra sqplite3 blir importert
const fileUpload = require('express-fileupload'); //fil opplastning blir importert

const app = express(); //express opprettes i en variabel vi kaller for "app"

//session aktiveres  i express appen 
app.use(session({
    secret: "Enlangstring",
    resave: false,
    saveUninitialized: false 
}))


app.use(express.urlencoded({extended: true}))//data fra nettsiden blir sendt til serveren

//funksjon for filopplastning funksjonalitet
app.use(fileUpload());
app.get("/registrer", (req, res) => {
    res.sendFile(path.join(__dirname, "/registrer.html"))
})

app.use(express.static(__dirname + '/Sosial-samlingssted'));


//sjekker om brukeren er logget inn på nettsiden med loggedin requesten
app.get("/", (req, res) => {
    if(req.session.loggedin) {
        res.sendFile(path.join(__dirname, "/forside.html"))
    } else{
        res.sendFile(path.join(__dirname, "/login.html"))
    }
})

//her håndteres innloggingen på nettsiden, det sjekkes i databasen om brukernavn og passord finnes
app.post("/login", async (req, res) => {
    let login = req.body;

    let userData = db.prepare("SELECT * FROM user WHERE name = ?").get(login.name);//henter ut informasjon om bruker fra databasen som sendes til innloggingen

    if(await bcrypt.compare(login.password, userData.hash)) {
        console.log("Rett passord") //om passordet er riktig, skrives denne meldingen ut 
        req.session.loggedin = true
        res.sendFile(__dirname + "/forside.html")//bruker sendes til denne siden om pålogginsinformasjon er riktig
    } else {
        console.log("Feil passord")//om passordet er feil, skrives denne meldingen ut
        res.redirect("back")
    }
})

//rute for å lagre data når en ny bruker registreres
app.post(("/addUser"), async (req, res) => {
    let svar = req.body;

    let hash = await bcrypt.hash(svar.password, 10)
    console.log(svar)
    console.log(hash)

    db.prepare("INSERT INTO user (name, email, hash) VALUES (?, ?, ?)").run(svar.name, svar.email, hash)

    res.redirect("back")
})

//
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

//rute for siden som brukes for å laste opp bilde
app.get("/lastopp", (req, res) => {
    res.sendFile(__dirname + "/image.html")
})

app.get('/admin', function(req, res) {
    res.render('admin');
});

app.use(express.static('¨public'));
app.use(express.json());

app.set('view engine', 'hbs');

//admin kan slette brukere fra databasen på nettsiden
app.post('/deleteUser', (req, res) => {
    const id = req.body.id;
    const sql = 'DELETE FROM users WHERE id = ?';
    db.run(sql, [id], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send({ error: 'Kunne ikke slette bruker fra database' });
        } else {
            res.send({ message: `User with ID ${id} deleted` });
        }
    });
});


app.get('/users', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({ erroe: 'Could not retrieve users from database'});
        } else {
            res.send(rows);
        }
    });
});




//


//starter opp serveren i terminalen og viser til linken serveren kjører på
const PORT = 3000;
app.listen("3000", () => {
    console.log("Server listening at http://localhost:3000")
})