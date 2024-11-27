const express = require('express');
const dotenv = require('dotenv').config();
const path = require('path');
const route = require('./routes/route');
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const {User, Contribution} = require('./models/schema')
const {getConnection} = require('./models/models')

const app = express();
const port = process.env.PORT || 3000;

let db;

// Middleware
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.set('view engine', 'ejs');
 

getConnection;

// Routes
app.use('/contribution', route);  
 

app.listen(port, () => {
    console.log(`The app runs on port: ${port}`);
});
