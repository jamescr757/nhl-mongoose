const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CompletedSchema = new Schema({

    date: {
        type: String,
        required: "Date is required"
    },

    gameId: {
        required: "Game ID required",
        type: String,
        unique: true
    },

    teams: {
        type: Array
    },

    scoreline: {
        type: String
    },

    score: {
        type: Boolean, 
        default: true
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

    homeScore: {
        type: String
    },

    awayTeam: {
        type: String
    },

    awayTeamRecord: {
        type: String
    },

    awayScore: {
        type: String
    }

});

const Completed = mongoose.model("Completed", CompletedSchema);

module.exports = Completed;