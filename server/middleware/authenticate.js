// Authentication Middleware



// Load Module
// Data Module Sends Back (Exports) isn't Manipulated
// Store Exported Data as a Constant

// Local Module
const {User} = require("./../models/user");



// Authentication Middleware
var authenticate = (req, res, next) => {

    // Fetch Token from Request Header "x-auth"
    var token = req.header("x-auth");

    // Fetch User Document with Given Token
    // Handle Errors (such as an Invalid/Altered Token)
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send();
    });
};



// Data to Export
// Exported Data is Stored in "require('<path-to-authenticate.js>/authenticate.js')"
module.exports = {
    authenticate
};
