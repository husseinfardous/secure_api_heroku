// To-Do Model



// Load Module
// Data Module Sends Back (Exports) isn't Manipulated
// Store Exported Data as a Constant

// Third Party Module
const mongoose = require("mongoose");



// Create To-Do Model
var Todo = mongoose.model("Todo", {
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});



// Data to Export
// Exported Data is Stored in "require('<path-to-todo.js>/todo.js')"
module.exports = {
    Todo
};
