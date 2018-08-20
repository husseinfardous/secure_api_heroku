// Mongoose Configuration File



// Load Module
// Data Module Sends Back (Exports) isn't Manipulated
// Store Exported Data as a Constant

// Third Party Module
const mongoose = require("mongoose");



// Configure Mongoose

// Use Built-In Promise Library
mongoose.Promise = global.Promise;

// Connect to Database in MongoDB Server
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true
});



// Data to Export
// Exported Data is Stored in "require('<path-to-mongoose.js>/mongoose.js')"
module.exports = {
    mongoose
};
