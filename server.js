const express = require("express");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");

// Initialize Express
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

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  const yesterday = moment().subtract(1, 'days').format("YYYYMMDD");

  db.Completed.find({
    date: yesterday
  })
  .then((data) => {
    res.render("index", { gameArray: data });
  })
  .catch(error => console.log(error.message))
  
});

app.get("/date/:date", function(req, res) {

  db.Completed.find({
    date: req.params.date
  })
  .then((data) => {
    res.render("index", { gameArray: data });
  })
  .catch(error => console.log(error.message))
  
});

// console.log(moment().calendar("Yesterday", "MM/DD/YYYY"));

app.get("/scrape", (req, res) => {
  
  const yesterday = moment().subtract(1, 'days').format("YYYYMMDD");
    
  axios.get(`https://www.espn.com/nhl/scoreboard/_/date/${yesterday}`).then(function(response) {

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
        date: `${yesterday}`,
        gameId: `${yesterday}${awayID}${homeID}`,
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
    }

    
  })
  .catch(error => console.log(error.message));
    
  res.send("Scrape complete");
});

app.get("/scrape/past-date/:date", (req, res) => {
    
  axios.get(`https://www.espn.com/nhl/scoreboard/_/date/${req.params.date}`).then(function(response) {

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
        date: `${req.params.date}`,
        gameId: `${req.params.date}${awayID}${homeID}`,
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
    }

    
  })
  .catch(error => console.log(error.message));
    
  res.send("Scrape complete");
});

app.get("/scrape-future", (req, res) => {

  // db.Future.drop()

  for (j = 1; j <= 4; j ++) {
    const monthNum = `0${j}`;

    let numDays;
    if (monthNum === "01") numDays = 31;

    else if (monthNum === "02") numDays = 29;

    else if (monthNum === "03") numDays = 31;

    else if (monthNum === "04") numDays = 4;
  
    for (let i = 1; i <= numDays; i ++) {
    
      let dateNum;
      if (i < 10) dateNum = `0${i}`;
    
      else dateNum = i;
    
      axios.get(`https://www.espn.com/nhl/scoreboard/_/date/2020${monthNum}${dateNum}`).then(function(response) {
    
        var $ = cheerio.load(response.data);
      
        const teams = $(".Scoreboard").find(".ScoreCell__TeamName");

        const records = $(".Scoreboard").find("span.ScoreboardScoreCell__Record");
    
        for (i = 0; i < teams.length; i += 2) {
          let home = i + 1;
          let away = i;

          db.Future.create({
            date: `${monthNum}/${dateNum}/2020`,
            teams: [`${teams[away].children[0].data}`, `${teams[home].children[0].data}`],
            scoreline: `${teams[away].children[0].data} AT ${teams[home].children[0].data}`,
            homeTeam: `${teams[home].children[0].data}`,
            homeTeamRecord: `${records[home].children[0].data}`,
            awayTeam: `${teams[away].children[0].data}`,
            awayTeamRecord: `${records[away].children[0].data}`,
          })
        }
    
        
      })
      .catch(error => console.log(error.message));
    
    }
  }
  res.send("Scrape complete");  
});


app.get("/all", function(req, res) {

  db.Completed.find({}).sort("-date")
    .then(data => res.json(data))
    .catch(error => console.log(error.message));

});

app.get("/team/:teamName", function(req, res) {

  db.Completed.find({

    teams: {
      $in: [req.params.teamName]
    }

  }).sort("-date")
    .then(data => res.json(data))
    .catch(error => console.log(error.message));
});

app.get("/team-win/:teamName", function(req, res) {

  db.Completed.find({

    winner: req.params.teamName

  }).sort("-date")
  .then(data => res.json(data))
  .catch(error => console.log(error.message));

});

app.get("/team-loss/:teamName", function(req, res) {

  db.Completed.find({

    loser: req.params.teamName

  }).sort("-date")
  .then(data => res.json(data))
  .catch(error => console.log(error.message));

});

app.get("/team-home/:teamName", function(req, res) {

  db.Completed.find({

    homeTeam: req.params.teamName

  }).sort("-date")
  .then(data => res.json(data))
  .catch(error => console.log(error.message));

});

app.get("/team-away/:teamName", function(req, res) {

  db.Completed.find({

    awayTeam: req.params.teamName

  }).sort("-date")
  .then(data => res.json(data))
  .catch(error => console.log(error.message));

});

app.get("/team-overtime/:teamName", function(req, res) {

  db.Completed.find({

    teams: {
      $in: [req.params.teamName]
    },
    overtime: true

  }).sort("-date")
  .then(data => res.json(data))
  .catch(error => console.log(error.message));

});

app.get("/date/:month/:day/:year", function(req, res) {

  const { month, day, year } = req.params;

  db.Completed.find({

    date: `${month}/${day}/20${year}`

  }).sort("-date")
  .then(data => res.json(data))
  .catch(error => console.log(error.message));

});



app.listen(PORT, function() {
  console.log(`App running on http://localhost:${PORT}/`);
});
