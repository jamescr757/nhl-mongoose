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

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.render("index", {});
});

// console.log(moment().calendar("Yesterday", "MM/DD/YYYY"));

app.get("/scrape", (req, res) => {

  // db.Completed.drop()

  for (j = 10; j < 13; j ++) {
    const monthNum = j;
    let numDays;

    if (monthNum === 10) numDays = 32;

    else if (monthNum === 11) numDays = 31;

    else numDays = 11;
  
    for (let i = 1; i < numDays; i ++) {

      let dateNum;
      if (i < 10) dateNum = `0${i}`;
    
      else dateNum = i;
    
      axios.get(`https://www.espn.com/nhl/scoreboard/_/date/2019${monthNum}${dateNum}`).then(function(response) {
    
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

          let winner;
          let loser;
          if (scores[teamIndex].children[0].data > scores[teamIndex + 1].children[0].data) {

            winner = teams[teamIndex].children[0].data;
            loser = teams[teamIndex + 1].children[0].data;

          } else {

            winner = teams[teamIndex + 1].children[0].data;
            loser = teams[teamIndex].children[0].data;

          }

          db.Completed.create({
            date: `${monthNum}/${dateNum}/2019`,
            teams: [`${teams[teamIndex].children[0].data}`, `${teams[teamIndex + 1].children[0].data}`],
            scoreline: `${teams[teamIndex].children[0].data}: ${scores[teamIndex].children[0].data} || ${teams[teamIndex + 1].children[0].data}: ${scores[teamIndex + 1].children[0].data}`,
            winner: winner,
            loser: loser,
            overtime: overtime,
            homeTeam: `${teams[teamIndex + 1].children[0].data}`,
            homeTeamRecord: `${records[teamIndex + 1].children[0].data}`,
            awayTeam: `${teams[teamIndex].children[0].data}`,
            awayTeamRecord: `${records[teamIndex].children[0].data}`,
          })
        }
    
        
      })
      .catch(error => console.log(error.message));
    
    }
  }
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
