const express = require("express"); //express blir importert
const session = require("express-session"); //sessions blir importert
const bcrypt = require("bcrypt"); //bcrypt blir importert
const path = require("path"); //path blir importert
const db = require("better-sqlite3") ("app.db") //db min fra sqplite3 blir importert
const fileUpload = require('express-fileupload'); //fil opplastning blir importert
const handlebars = require('handlebars');

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
//brukerens passord hashes og blir lagret i databasen
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
    console.log(req.session)
    if (req.session.visits == undefined) {
        req.session.visits = 1
    } else {
        req.session.visits++
    }

    res.send("Antall besøkende: " + req.session.visits)
})


// rute for bilde
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

//////////////////////////////////////////////////////////////////////////////
//rute for admin siden

app.get("/admin", (req, res) => {
    let users = db.prepare("SELECT * FROM user").all(); //henter brukere fra databasen

    res.render("admin", { users: users }); //data til bruker sendes til admin.hbs
});

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');


app.use(express.static('public'));
app.use(express.json());


//admin kan slette brukere fra databasen på nettsiden
app.post('/deleteUser', (req, res) => {
    const id = req.body.userId;
    const sql = 'DELETE FROM user WHERE id = ?';
    db.run(sql, [id], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send({ error: 'Kunne ikke slette bruker fra database' });
        } else {
            res.send({ message: `User with ID ${id} delted` });
        }
    });
});


app.get('/user', (req, res) => {
    const sql = 'SELECT * FROM user';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({ error: 'Could not retrieve users from database'});
        } else {
            res.send(rows);
        }
    });
});


/////////////////////////////////////////////////////////////////////////////////


//logg ut for brukere
function logout() {
    //sletter brukerdata og variabler tilbakestilles
    document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    //tilbake til logg inn siden
    window.location.href = "login.html";
}

//rute for logg ut
//app.get("/logout", (req,res) => {
 //   req.session.loggedin = false;
 //   res.redirect("/");
//});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            console.log(err);
        } else {
            res.redirect('/')
        }
    });
});



app.get("/", (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, "/forside.html")); //sender brukere til forside hvis logget inn
    } else {
        res.sendFile(path.join(__dirname, "/login.html")); //sender brukere til login hvis de ikke har en bruker registrert
    }
});


//Rute for at bruker kan slette sin egen profil
app.post('/delete-account', function(req, res) {
    //sletter konto fra databasen og deretter redirecter til login siden
});


//


//starter opp serveren i terminalen og viser til linken serveren kjører på
const PORT = 3000;
app.listen("3000", () => {
    console.log("Server listening at http://localhost:3000")
});