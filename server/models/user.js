// User Model



// Load Modules
// Data Modules Send Back (Export) isn't Manipulated
// Store Exported Data as Constants

// Third Party Modules
const _ = require("lodash");
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");



// Create User Schema (Allows Custom Methods)
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "{VALUE} is not a Valid Email Address!"
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

// Instance Method
// Only Return "_id" and "email" Properties of User Document
UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ["_id", "email"]);
};

// Instance Method
// Generate Authentication Token
// Add Token to tokens Array in User Document
UserSchema.methods.generateAuthToken = function() {

    // Fetch Individual User Document
    var user = this;

    // Set Token Access
    var access = "auth";

    // Generate Authentication Token 
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

    // Add Access and Token to tokens Array in User Document
    user.tokens = user.tokens.concat([{access, token}]);
    return user.save().then(() => {
        return token;
    });
};

// Instance Method
// Remove Token from tokens Array in User Document
UserSchema.methods.removeToken = function(token) {

    // Fetch Individual User Document
    var user = this;

    // Remove Token from tokens Array in User Document
    return user.update({
        $pull: {
            tokens: {token}
        }
    });
};

// Model Method
// Fetch User Document with Given Token
UserSchema.statics.findByToken = function(token) {

    // Fetch User Model
    var User = this;

    // Verify Token given by User
    // Handle Errors (such as an Invalid/Altered Token)
    var decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch(e) {
        return Promise.reject();
    }

    // Fetch User Document with Given Token
    return User.findOne({
        _id: decoded._id,
        "tokens.token": token,
        "tokens.access": "auth"
    });
};

// Model Method
// Fetch User Document with Given Credentials
UserSchema.statics.findByCredentials = function(email, password) {

    // Fetch User Model
    var User = this;

    // Fetch User Document with Given Email
    // Verify Password given by User
    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                }
                else {
                    reject();
                }
            });
        });
    });
};

// Instance Method
// Hash Password before Saving User Document
UserSchema.pre("save", function(next) {

    // Fetch Individual User Document
    var user = this;

    // Hash Password if "password" was Added/Modified
    if (user.isModified("password")) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    }
    else {
        next();
    }
});

// Create User Model
var User = mongoose.model("User", UserSchema);



// Data to Export
// Exported Data is Stored in "require('<path-to-user.js>/user.js')"
module.exports = {
    User
};
