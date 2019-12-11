const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GameNoteSchema = new Schema({

  comments: String

});

const GameNote = mongoose.model("GameNote", GameNoteSchema);

module.exports = GameNote;