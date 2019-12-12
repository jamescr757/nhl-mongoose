const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FutureSchema = new Schema({

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

    gameline: {
        type: String
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

const Future = mongoose.model("Future", FutureSchema);

module.exports = Future;