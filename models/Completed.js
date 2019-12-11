const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CompletedSchema = new Schema({

    date: {
        type: String,
        required: "Date is required"
    },

    teams: {
        type: Array
    },

    scoreline: {
        type: String
    },

    winner: {
        type: String
    },

    loser: {
        type: String
    },

    overtime: {
        type: Boolean
    },

    homeTeam: {
        type: String
    },

    homeTeamRecord: {
        type: String
    },

    awayTeam: {
        type: String
    },

    awayTeamRecord: {
        type: String
    },

    gameNote: {
        type: Schema.Types.ObjectId,
        ref: "GameNote"
    }

});

const Completed = mongoose.model("Completed", CompletedSchema);

module.exports = Completed;