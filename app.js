"use strict";

// This Express Application will
// allow users to create and run their own blogs
// Runs on MySQL db and uses session for authentication
const express = require('express');
const bcrypt = require('bcrypt');   //bcrypt for creating password hashes
const db = require('./models/dbservice');   //database operations
const session = require('express-session');
require('dotenv').config();

const app = express();

const port = process.env.PORT;

const TWO_HOURS = 1000 * 60 * 60 * 2;   //lifetime of session cookie

const {
    SESS_NAME = 'sid',
    SESS_LIFETIME = TWO_HOURS,
    SESS_SECRET = 'mysecret'
} = process.env;

//Session settings
app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: false
    }
}));

app.set('view engine', 'ejs');

app.use(express.static(__dirname, +'/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use((req, res, next) => {
    const { userId, username, email } = req.session;
    if(userId && username) {
        res.locals.userId = userId;
        res.locals.username = username;
        res.locals.email = email;
    }
    next();
});

// Ensures user navigating to the home page is logged in, 
// otherwise redirects to login page
const loggedIn = function(req, res, next) {
    if(req.session.userId === undefined) {
        res.redirect('/login');
    }
    console.log('Done');
    next();
}

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/home', loggedIn, (req, res) => {
    res.render('home.ejs');
});

// Fetch all posts by all users
app.get('/getallposts', async (req, res) => {
    try {
        let results = await db.get_all_posts();
        //create object post feed and store post data in array inside it
        let post_feed = { username:[], day:[], month:[], year:[], title:[], body:[] };
        results.forEach(result => {
            post_feed.username.push(result.user_name);
            post_feed.day.push(result.DAY);
            post_feed.month.push(result.MONTH);
            post_feed.year.push(result.YEAR);
            post_feed.title.push(result.title);
            post_feed.body.push(result.body);
        });

        res.send({post_feed: post_feed});
    } catch(error) {
        console.log(error);
    }
});


app.get('/newpost', (req, res) => {
    res.render('newpost.ejs');
});

app.post('/newpost', async (req, res) => {
    const title = req.body.posttitle;
    const body = req.body.postbody;
    const userid = res.locals.userId;
    try {
        let results = await db.create_post(title, body, userid);
        console.log(results);
        res.send({msg: "Done"});
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/login', async (req, res) => {
    const user_name = req.body.user_name;
    const password = req.body.password;
    try {
        if(user_name && password) {
            let results = await db.find_user(user_name);
            let storedPass = await bcrypt.compare(password, results[0].passwd);
            console.log(results[0]);
            if(storedPass) {
                req.session.userId = results[0].user_id;
                req.session.username = results[0].user_name;
                req.session.email = results[0].email;
                console.log(req.session);
                res.redirect('/home');
            } else {
                res.send({err: "Wrong password"});
            }
        } else {
            res.send({ err: "username / password missing" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/register', (req, res) => {
    res.render('regiser.ejs');
});

app.post('/register', async (req, res) => {
    try {
        // Request body
        let username = req.body.user_name;
        let email = req.body.email;
        let password = req.body.password;

        //Hash password
        const hashedPass = await bcrypt.hash(password, 14);

        let results = await db.register_user(username, email, hashedPass); //save to database
        console.log(results);
        res.redirect('/login');
    } catch (error) {4
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/account', (req, res) => {
    const username = res.locals.username;
    const email = res.locals.email;
    
    res.render('account.ejs', {username: username, email: email});
});

app.get('/editprofile', (req, res) => {
    const username = res.locals.username;
    const email = res.locals.email;
    res.render('editprofile.ejs', {username: username, email: email});
});

app.post('/updateemail', async (req, res) => {
    const email = req.body.email;
    const id = res.locals.userId;
    try {
        let results = await db.update_email(email, id);
        console.log(results);
        res.send({msg: "Email modified"});
    } catch (error) {
        res.send({msg: error});
    }
});

app.post('/updateusername', async (req, res) => {
    const username = req.body.username;
    const id = res.locals.userId;
    try {
        let results = await db.update_username(username, id);
        console.log(results);
        res.send({msg: "Username modified"});
    } catch (error) {
        res.send({msg: error});
    }
});

// Removes user from db
app.post('/deleteuser', async (req, res) => {
    const id = res.locals.userId;
    try {
        let results = db.deleteuser(id);
        console.log(results);
        res.redirect('/logout');
    } catch(err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) return res.redirect('/home');
        res.clearCookie(SESS_NAME);
        res.redirect('/');
    });
});

//++++++++++++++++++++++++++++++++++++++ Post Routes ++++++++++++++++++++++++++++++++++++++++++++
app.post('/addpost', async (req, res) => {
    try {
        let result = await db.create_post(req.body.title, req.body.body, res.locals.user_id);
        console.log(result);
        res.send({msg: 'Successful'});
    } catch (error) {
        res.send({msg: error});
    }
});

app.listen(port);