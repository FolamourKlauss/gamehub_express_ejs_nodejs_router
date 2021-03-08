

const express = require('express');

// initialisation
const app = express();

// j'informe mon application de l'endroit où se trouvent les vues
app.set('views', './views');
// je l'informe aussi du moteur qu'elle va utiliser
app.set('view engine', 'ejs');
// et j'indique que le dossier public est "statique"
app.use(express.static('./public'));

const port = 3000;

// express.urlencoded retourne un MW qui se charge de créer une propriété body à l'objet de requête => à mettre dès qu'on a besoin de gréer des requetes POST !

app.use(express.urlencoded({ extended: true }));

// importons nos données
const games = require('./games.json');

const users = require('./users.json');

let currentUser = null;

const gameRouter = require('./routers/game');

// req.ip contient l'IP du client
// req.url contient l'url demandée par le client
// pour la date, on ne la trouvera pas dans req
// on se base sur un objet Date (JS natif) et on appelle la méthode toISOString()

// format souhaité : [date-iso ip] path

// on place le logger le plus tôt possible, pour s'assurer que toutes les requêtes sont loggées

app.use((req, res, next) => {

    const now = new Date(); // l'instant exact de la requête

    // le fameux message de journal
    console.log(`[${now.toISOString()} ${req.ip}] ${req.url}`);

    // systématiquement et inconditionnellement
    next();
});


// use branche un middleware qui s'exécute TOUT LE TEMPS (quelle que soit l'url)
// en tout premier, quand une requête parvient au serveur
// ce MW est lancé
app.use((req, res, next) => {
    res.locals = { games, promo: "Nemo", currentUser };

    next();
});


// les routes de l'application
app.get('/', (req, res) => {
    res.render('index');
});

// un petit render tout ce qu'il y a de plus classique

app.get('/login', (req, res) => {
    res.render('login');
});


// app.use permet d'ajouter un MW exécuté quel que soit la méthode utilisée
app.post('/login', (req, res) => {

    // pour que req.body soit accessible, pensez à la petite ligne là-haut (express.urlencoded)
    const nom = req.body.username;
    const pass = req.body.password;

    // trouvons un utilisateur qui correspond aux données envoyées
    const theUser = users.find(user => user.user === nom && user.pass === pass);

    if (theUser) {
        // faire persister l'utilisateur, c'est tout un art
        // pour l'instant, on le fait persister au niveau du serveur (il est donc partagé par TOUS les visiteurs, pas pratique...)
        currentUser = theUser;

        
        res.send("C'est bon");
    } else {
        
        res.send("Pas d'utilisateur avec ces infos");
    }
    
});

app.use(gameRouter);

// ici, la 404
app.use((req, res) => {
    // on indique "sémantiquement" que la ressource n'existe pas, et on répond avec une vue
    res.status(404).render('notfound');
});


app.listen(port, () => console.log(`http://localhost:${port}/`));


