const express = require("express");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");

const app = express();

const PORT = process.env.PORT || 3000;

// Database configuration
const db = require("./models");

// Use morgan logger for logging requests
app.use(logger("dev"));
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/nhlGames", { useNewUrlParser: true });

const teamsArray = ["bruins", "sabres", "red wings", "panthers", "canadiens", "senators", "lightning", "maple leafs", "hurricanes", "blue jackets", "devils", "islanders", "rangers", "flyers", "penguins", "capitals", "blackhawks", "avalanche", "stars", "wild", "predators", "blues", "jets", "ducks", "coyotes", "flames", "oilers", "golden knights", "kings", "sharks", "canucks"];

function teamIDGenerator(teamName) {
    return teamsArray.indexOf(teamName);
}

function scrapeScores(formattedDate) {

  axios.get(`https://www.espn.com/nhl/scoreboard/_/date/${formattedDate}`).then(function(response) {

    var $ = cheerio.load(response.data);
  
    const scores = $(".Scoreboard").find(".ScoreCell__Score")
  
    const teams = $(".Scoreboard").find(".ScoreCell__TeamName");

    const records = $(".Scoreboard").find("span.ScoreboardScoreCell__Record");

    const periods = $(".Scoreboard").find(".ScoreboardScoreCell__Headings");

    for (i = 0; i < periods.length; i++) {
      const teamIndex = i * 2;

      const numberOfPeriods = periods[`${i}`].children.length - 1;

      let overtime;
      if (numberOfPeriods > 3) overtime = true;

      else overtime = false;

      const awayTeam = teams[teamIndex].children[0].data.toLowerCase();
      const awayID = teamIDGenerator(awayTeam);
      const awayScore = scores[teamIndex].children[0].data;
      
      const homeTeam = teams[teamIndex + 1].children[0].data.toLowerCase();
      const homeID = teamIDGenerator(homeTeam);
      const homeScore = scores[teamIndex + 1].children[0].data;

      let winner;
      let loser;
      if (awayScore > homeScore) {

        winner = awayTeam;
        loser = homeTeam;

      } else {

        winner = homeTeam;
        loser = awayTeam;

      }

      db.Completed.create({
        date: `${formattedDate}`,
        gameId: `${formattedDate}${awayID}${homeID}`,
        teams: [`${awayTeam}`, `${homeTeam}`],
        scoreline: `${awayTeam}: ${awayScore} || ${homeTeam}: ${homeScore}`,
        winner,
        loser,
        overtime,
        homeTeam, 
        homeTeamRecord: `${records[teamIndex + 1].children[0].data}`,
        homeScore, 
        awayTeam, 
        awayTeamRecord: `${records[teamIndex].children[0].data}`,
        awayScore, 
      })
      .catch(error => console.log(error.message));
    }

    
  })
  .catch(error => console.log(error.message));
    
}

app.get("/", function(req, res) {

  const yesterday = moment().subtract(1, 'days').format("YYYYMMDD");

  scrapeScores(yesterday);

  res.redirect("/loading/" + yesterday);
  
});

app.get("/scrape/past-date/:date", (req, res) => {
    
  scrapeScores(req.params.date);

  res.status(200).end();

});

app.get("/loading/:date", (req, res) => {

  const dateDisplay = moment(req.params.date).format("dddd, MMMM Do, YYYY");

  const contextObj = { date: dateDisplay }

  const yesterday = moment().subtract(1, 'days').format("YYYYMMDD");

  if (req.params.date === yesterday) contextObj.dateIsYesterday = true;
  
  res.render("loading", contextObj);
  
});

app.get("/date/:date", function(req, res) {

  const yesterday = moment().subtract(1, 'days').format("YYYYMMDD");

  const dateDisplay = moment(req.params.date).format("dddd, MMMM Do, YYYY");

  db.Completed.find({
    date: req.params.date
  })
  .then((data) => {

    const contextObj = {
      gameArray: data,
      date: dateDisplay
    }

    if (data.length === 0 && req.params.date === yesterday) contextObj.noRecordsYesterday = true;

    else if (data.length === 0) contextObj.noRecords = true;

    res.render("index", contextObj);
  })
  .catch(error => {
    res.status(400).end();
    console.log(error.message)
  })
  
});

app.get("/check/:date", function(req, res) {

  db.Completed.find({
    date: req.params.date
  })
  .then((data) => {

    if (data.length > 0) {
      // finished with scrape, can tell front-end to load scores page
      res.status(200).end();
    } else {
      // no error, but need to tell front-end to not load scores page yet
      res.status(400).end();
    }

  })
  .catch(error => {
    res.status(400).end();
    console.log(error.message)
  })
  
});

app.listen(PORT, function() {
  console.log(`App running on http://localhost:${PORT}/`);
});
