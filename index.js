import express from "express";
import exphbs from 'express-handlebars';
import session from 'express-session';
import flash from 'express-flash';

const app = express();

import pgPromise from 'pg-promise';

const pgp = pgPromise({})

const local_database_url = 'postgres://codex:pg123@localhost:5432/spaza_suggest';
const connectionString = process.env.DATABASE_URL || local_database_url;

const config = {
    connectionString
}
if (process.env.NODE_ENV == "production") {
    config.ssl = {
        rejectUnauthorized: false
    }
}

app.use(session({
    secret: 'codeforgeek',
    saveUninitialized: true,
    resave: true
}));


const db = pgp(config);


import theSpaza from './spaza-suggest.js'


app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())


app.use(flash());


import  ShortUniqueId  from 'short-unique-id';
const uid = new ShortUniqueId({ length: 5 });


app.use(session({
    secret: "<add a secret string here>",
    resave: false,
    saveUninitialized: true
}));



app.get('/', async function (req, res) {

    res.render("mylogin", {

    })
})
const mySpaza = theSpaza(db)

app.get('/suggest/:name',async function(req,res){

    let theCode = req.body.code
    let mySuggestion = await mySpaza.clientLogin(theCode)

    res.render('suggest',{
        theCode,
        mySuggestion
    })
})

app.post('/login', async function (req, res) {

    let theCode = req.body.code
   
    let check = await mySpaza.clientLogin(theCode)



    if (check) {

       
        res.redirect(`/suggest/${theCode}`)
       
    } else  {
       
        req.flash('error', 'Enter a valid code please');
        res.redirect('/')

    }
})

app.post('/signup', async function(req,res){

    const userName = req.body.name;
   

    if (userName) {

        const code = await mySpaza.registerClient(userName)


        req.flash('info', 'Hi User, your Account is created!  login code is: ' + code);

    } else {
        req.flash('error', 'Enter a valid name please');

    }

    res.render('mysignup',{
   
    })
})

app.get('/signup', async function( req,res){

    res.render('mysignup')
})

app.post('/clientSuggestions', async function(req,res){
    
    let town = req.body.town

    let theFilter = await db.findAreaByName(town)
  
    if (!town) {
      req.flash('info', 'Please Select Town')
    }

    if(!1 || 2 || 3 ||4 ){
      req.flash('info', 'There are no suggestions for the town selected')
    }

    res.render("suggest", {
      
    })

})


const PORT = process.env.PORT || 1997;

app.listen(PORT, function () {
    console.log("App started at port:", PORT)
});