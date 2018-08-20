// Secure API

// Sets Up User Model, Generates Authentication Tokens, and Hashes Passwords to Secure User Data
// Uses Mongoose to Store To-Do Tasks of Users in MongoDB



// Load Modules
// Data Modules Send Back (Export) isn't Manipulated
// Store Exported Data as Constants

// Third Party Modules
const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require("mongodb");

// Local Modules
require("./config/config");
const {mongoose} = require("./db/mongoose");
const {Todo} = require("./models/todo");
const {User} = require("./models/user");
const {authenticate} = require("./middleware/authenticate");



// Configure Web Application

// Configure Port for Testing, Development, and for Production (Heroku)
const port = process.env.PORT;

// Create Web Application through Call to Express
// Create Express Server by Implicitly calling "http.createServer()"
var app = express();

// Configure Body Parser Middleware
// Enables Express to Accept and Parse JSON Data (Request Body)
app.use(bodyParser.json());



// Routes (Endpoints)

// "/users" (Public) (Signup)
app.post("/users", (req, res) => {

    // Pick Off Properties from Request Body
    // Prevent User from Adding/Updating Unwanted User Document Properties
    var body = _.pick(req.body, ["email", "password"]);

    // Create User
    var user = new User(body);

    // Generate Authentication Token
    // Save User as Document in MongoDB Database
    // Send Token as "x-auth" Header
    // Handle Errors
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header("x-auth", token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// "/users/login" (Public) (Login)
app.post("/users/login", (req, res) => {

    // Pick Off Properties from Request Body
    // Prevent User from Adding/Updating Unwanted User Document Properties
    var body = _.pick(req.body, ["email", "password"]);

    // Fetch User Document by Given Credentials
    // Send Token as "x-auth" Header
    // Handle Errors
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header("x-auth", token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

// "/users/me/token" (Private) (Logout)
app.delete("/users/me/token", authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

// "/users/me" (Private)
app.get("/users/me", authenticate, (req, res) => {
    res.send(req.user);
});

// "/todos" (Private)

app.post("/todos", authenticate, (req, res) => {

    // Create To-Do from Request Body
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    // Save To-Do as Document in MongoDB Database
    // Handle Errors
    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get("/todos", authenticate, (req, res) => {

    // Fetch All To-Do Documents for Logged In User from MongoDB Database
    // Handle Errors
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

// "/todos/<id>" (Private)

app.get("/todos/:id", authenticate, (req, res) => {

    // Get ID from Request Parameter
    var id = req.params.id;

    // Invalid ID
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // Fetch To-Do Document by ID for Logged In User from MongoDB Database
    // Handle Errors
    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.patch("/todos/:id", authenticate, (req, res) => {

    // Get ID from Request Parameter
    var id = req.params.id;

    // Pick Off Properties from Request Body
    // Prevent User from Adding/Updating Unwanted To-Do Document Properties
    var body = _.pick(req.body, ["text", "completed"]);

    // Invalid ID
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // Create Timestamp for completedAt Property in To-Do Document if completed Property is Set to True
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    }

    // Clean-Up if completed Property of To-Do Document is either Set to False or to a Non-Boolean Value
    else {
        body.completed = false;
        body.completedAt = null;
    }

    // Fetch and Update To-Do Document by ID for Logged In User from MongoDB Database
    // Handle Errors
    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete("/todos/:id", authenticate, (req, res) => {

    // Get ID from Request Parameter
    var id = req.params.id;

    // Invalid ID
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // Fetch and Remove To-Do Document by ID for Logged In User from MongoDB Database
    // Handle Errors
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});



// Start the Server on Port Given by Heroku or on Port 3000
app.listen(port, () => {
    console.log(`Server is Running on Port ${port}...`);
});
