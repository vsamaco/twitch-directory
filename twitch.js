var application_root = __dirname,
    path = require('path'),
    http = require('http'),
    url = require('url'),
    request = require('request'),
    express = require('express'),
    mongoose = require('mongoose');

var app = express();

var config = {
  "elophant_key": "V45wByoYCe2ESQ7h3tnC",
  "port": (process.env.PORT || 1337),
  "database": (process.env.MONGOLAB_URI || 'localhost/directorydb'),
  "summoners": {}
};

var db = mongoose.createConnection(config.database);
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
  console.log('open db: ' + config.database);
});

var Schema = mongoose.Schema;

var Thing = new Schema({
  name: String
});

var Champion = new Schema({
  summonerInternalName: String,
  spell1Id: Number,
  spell2Id: Number,
  selectedSkinIndex: Number,
  championId: Number
});

var TeamPlayer = new Schema({
  accountId: Number,
  summonerInternalName: String,
  summonerId: Number,
  pickTurn: Number
});

var LoLActiveGame = new Schema({
  id: String,
  type: String,
  state: String,
  mapId: String,
  champions: [Champion],
  teamOne: [TeamPlayer],
  teamTwo: [TeamPlayer]
});

var LoLGamePlayer = new Schema({
  championId: Number,
  summonerId: Number,
  summonerName: String,
  teamId: Number,
});

var LoLGameStat = new Schema({
  type: String,
  value: Number,
  dataVersion: Number
});

var LoLGame = new Schema({
  _creator: {type: Schema.Types.ObjectId, ref: 'Stream'},
  id: Number,
  type: String,
  queueType: String,
  mapId: Number,
  players: [LoLGamePlayer],
  teamId: Number,
  championId: Number,
  spell1: Number,
  spell2: Number,
  created: Date,
  statistics: [LoLGameStat]
});

var LoLStat = new Schema({
  summaryType: String,
  maxRating: Number,
  rating: Number,
  wins: Number,
  losses: Number,
  updated: Date
});

var Stream = new Schema({
  name: String,
  streamId: String,
  accountId: String,
  summonerName: String,
  state: String,
  viewers: Number,
  preview: String,
  game: String,
  logo: String,
  updated_at: String,
  live: Boolean,
  lolGames: [{type: Schema.Types.ObjectId, ref: 'LoLGame'}],
  lolStats: [LoLStat]
});

var TeamPlayerModel = db.model('TeamPlayer', TeamPlayer);
var ChampionModel = db.model('Champion', Champion);
var LoLActiveGameModel = db.model('LoLActiveGame', LoLActiveGame);
var LoLGamePlayerModel = db.model('LoLGamePlayer', LoLGamePlayer);
var LoLGameStatModel = db.model('LoLGameStatModel', LoLGameStat);
var LoLGameModel = db.model('LoLGame', LoLGame);
var LoLStatModel = db.model('LolStat', LoLStat);
var StreamModel = db.model('Stream', Stream);

var upsertData = function(model) {
  var data = model.toObject();
  delete data._id;
  return data;
};


// Internal mapping stream to summonername
// TODO: move to redis hash map
config.summoners['wingsofdeath'] = 'wingsofdeathx';
config.summoners['dandinh'] = 'mandinh';
config.summoners['tsm_dyrus'] = 'dyrus';
config.summoners['aphromoo'] = 'aphromoo';

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpException: true, showStack: true }));
});

app.get('/stream/:name', function(req, res) {
  console.log("streams#name");
  res.sendfile("public/index.html");
});

app.get('/api', function(req, res) {
  res.send('Twitch API is running');
});

app.get('/api/streams2/:game', function(req, res) {
  var options = {
    protocol: 'https:',
    host: 'api.twitch.tv/kraken',
    pathname: '/streams',
    query: {game: req.params.game, limit: 12}
  };
  
  var query = url.format(options).replace(/%20/g, '+');
  console.log('RETREIVING: ' + query);
  
  request(query).pipe(res);
});

app.get('/api/streams/:game', function(req, res) {
  return StreamModel.find({live: true}, null, {limit: 12, sort: {viewers: -1}}, function(err, streams) {
    if(!err) {
      return res.send(streams);
    } else {
      return console.log(err);
    }
  });
});

app.get('/api/stream/:name', function(req, res) {
  return StreamModel.findOne({streamId: req.params.name.toLowerCase()})
          .populate('lolGames', null, null, {limit: 5, sort: {created: -1}})
          .exec(function(err, stream) {
            if(!err) {
              console.log('success');
              return res.send(stream);
            } else {
              console.log(err);
              return res.send('Error');
            }
          });
});

app.get('/api/stream2/:name', function(req, res) {
  var options = {
    protocol: 'https:',
    host: 'api.twitch.tv/kraken',
    pathname: '/streams/' + req.params.name,
  };
  
  var query = url.format(options).replace(/%20/g, '+');
  console.log('RETREIVING: ' + query);
  
  // Get Twitch Stream data
  request(query, function(err, response, body) {
    var this_res = res;
    var twitch_data = JSON.parse(body);

    // Get Elophant data if name exists summoners mapping
    if (config.summoners[req.params.name]) {
      var summonerName = config.summoners[req.params.name];
      var elophant_options = {
        protocol: 'http:',
        host: 'elophant.com/api/v1/na',
        pathname: '/getInProgressGameInfo',
        query: {summonerName: summonerName, key: config.elophant_key}
      };
    
      request(url.format(elophant_options), function(elo_err, elo_response, elo_body) {
        if (elo_body) {
          var elophant_data = JSON.parse(elo_body);

          // Grab relevant player data from championselections array

          elophant_data['game']['playerChampionSelections'].forEach(function(player) {
            var playerName = player['summonerInternalName'];
            if (summonerName == playerName) {
              console.log(player);
              elophant_data['player'] = player;
            }
          });

          twitch_data['stream']['elophant'] = elophant_data;
        }
        this_res.send(twitch_data);
      });
    } else {
      res.send(twitch_data);
    }
  });
  
  //request(query).pipe(res);
});

app.get('/api/game/:name', function(req, res) {
  var options = {
    protocol: 'http:',
    host: 'elophant.com/api/v1/na',
    pathname: '/getInProgressGameInfo',
    query: {summonerName: req.params.name, key: config.elophant_key}
  };
  
  var query = url.format(options);
  console.log('RETREIVING: ' + query);
    
  request(query, function(err, response, body) {
    var game = JSON.parse(body);
    
    // Build Champion Array
    var champions = [];
    game.game.playerChampionSelections.forEach(function(gameChampion) {
      var champion = new ChampionModel({
        summonerInternalName: gameChampion.summonerInternalName,
        spell1Id: gameChampion.spell1Id,
        spell2Id: gameChampion.spell2Id,
        selectedSkinIndex: gameChampion.selectedSkinIndex,
        championId: gameChampion.championId
      });
      
      champions.push(champion);
    });
    
    // Build TeamOne Array
    var teamOne = [];
    game.game.teamOne.forEach(function(player) {
      var teamPlayer = new TeamPlayerModel({
        accountId: player.accountId,
        summonerInternalName: player.summonerInternalName,
        summonerId: player.summonerId,
        pickTurn: player.pickTurn
      });
      
      teamOne.push(teamPlayer);
    });
    
    // Build TeamTwo Array
    var teamTwo = [];
    game.game.teamTwo.forEach(function(player) {
      var teamPlayer = new TeamPlayerModel({
        accountId: player.accountId,
        summonerInternalName: player.summonerInternalName,
        summonerId: player.summonerId,
        pickTurn: player.pickTurn
      });
      
      teamTwo.push(teamPlayer);
    });
    
    var lolGame = new LoLGameModel({
      id: game.game.id,
      type: game.game.gameType,
      state: game.game.gameState,
      mapId: game.game.mapId,
      champions: champions,
      teamOne: teamOne,
      teamTwo: teamTwo
    });

    // console.log(lolGame);
    
    StreamModel.findOne({summonerName: req.params.name}, function(err, stream) {
      console.log("LOADED: " + stream.name);
      var found = false;
      stream.lolGames.forEach(function(game) {
        if(game.id == lolGame.id) {
          game = lolGame;
          console.log("UPDATING EXISTING GAME");
          found = true;
        }
      });
      if (!found) {
        stream.lolGames.push(lolGame);
        console.log("ADDING NEW GAME");
      }
      console.log(stream);
      stream.save(function(err) {
        if(!err) {
          return console.log("Stream Updated");
        } else {
          return console.log(err);
        }
      });
    });
    res.send(game);
  });
});

app.get('/cron/games/:name', function(req, res) {
  StreamModel.findOne({summonerName: req.params.name}, function(err, stream) {
    if(err) {
      return console.log(err);
    }
    
    if(!stream) return console.log("Stream not found");
    if(!stream.accountId) return console.log("No account ID found");
    
    var accountId = stream.accountId;

    var options = {
      protocol: 'http:',
      host: 'elophant.com/api/v1/na',
      pathname: '/getRecentGames',
      query: {accountId: accountId, key: config.elophant_key}
    };

    var query = url.format(options);
    console.log('RETREIVING: ' + query);
    
    request(query, function(err, response, body) {
      var gamesJSON = JSON.parse(body);
      
      lolGames = [];
      stream.lolgames = (stream.lolgames || []);
      gamesJSON.gameStatistics.forEach(function(gameStat) {
        
        var lolGamePlayers = [];
        gameStat.fellowPlayers.forEach(function(player) {
          var gamePlayer = new LoLGamePlayerModel({
            championId: player.championId,
            summonerId: player.summonerId,
            summonerName: player.summonerName,
            teamId: player.teamId
          });
          
          lolGamePlayers.push(gamePlayer);
        });

        var lolGameStats = [];
        gameStat.statistics.forEach(function(stat) {
          var lolGameStat = new LoLGameStatModel({
            type: stat.statType,
            value: stat.value,
            dataVersion: stat.dataVersion
          });
          
          lolGameStats.push(lolGameStat);
        });
        
        var lolgame = new LoLGameModel({
          _creator: stream._id,
          id: gameStat.gameId,
          type: gameStat.gameType,
          queueType: gameStat.queueType,
          mapId: gameStat.gameMapId,
          players: lolGamePlayers,
          teamId: gameStat.teamId,
          championId: gameStat.championId,
          spell1: gameStat.spell1,
          spell2: gameStat.spell2,
          created: gameStat.createDate,
          statistics: lolGameStats
        });
        
        LoLGameModel.findOne({id: lolgame.id}, function(err, game) {
          if(err) console.log(err);
          if(!game) { //create new record
            lolgame.save(function(err, data) {
              if(err) console.log(err);
              console.log("game saved:%s",lolgame._id);
              stream.lolGames.push(lolgame);
              stream.save(function(err, data) {
                if(err) return console.log(err, data);
                console.log("stream saved %s", data);
              });
            });
          } else {
            console.log("game already exists");
          }
        });
      });
      
      res.send(gamesJSON);
    });
  });  
});

app.get('/cron/stats/:name', function(req, res) {
  StreamModel.findOne({summonerName: req.params.name}, function(err, stream) {
    if(err) {
      return console.log(err);
    }

    if(!stream.accountId) {
      return console.log("No account ID found");
    }
    var accountId = stream.accountId;

    var options = {
      protocol: 'http:',
      host: 'elophant.com/api/v1/na',
      pathname: '/getPlayerStats',
      query: {accountId: accountId, season: "CURRENT", key: config.elophant_key}
    };

    var query = url.format(options);
    console.log('RETREIVING: ' + query);
    
    request(query, function(err, response, body) {
      var summaryJSON = JSON.parse(body);
  
      var stats = [];
      summaryJSON.playerStatSummaries.playerStatSummarySet.forEach(function(summarySet) {
        var stat = new LoLStatModel({
          summaryType: summarySet.playerStatSummaryType,
          maxRating: summarySet.maxRating,
          rating: summarySet.rating,
          wins: summarySet.wins,
          losses: summarySet.losses,
          updated: summarySet.modifyDate
        });
        stats.push(stat);
      });
  
      console.log(stats);
      stream.lolStats = stats;
      
      stream.save(function(err, data) {
        if(!err) {
          return console.log("Stream Updated");
        } else {
          return console.log(err);
        }
      });
    
      res.send(summaryJSON);
    });
  });
});

app.post('/api/streams', function(req, res) {
  var stream;
  console.log(req.body);
  stream = new StreamModel({
    title: req.body.title,
    streamId: req.body.streamId,
    summonerName: req.body.summonerName
  });

  StreamModel.update( {streamId: stream.streamId}, stream, {upsert: true}, function(err, data) {
    if(!err) {
      return console.log(data);
    } else {
      return console.log(err);
    }
  });
  
  
  return res.send(stream);
});

app.get('/cron/update-streams', function(req, res) {
  var game = "League of Legends";

  var options = {
    protocol: 'https:',
    host: 'api.twitch.tv/kraken',
    pathname: '/streams',
    query: {game: game, limit: 12}
    
  };
  
  var query = url.format(options).replace(/%20/g, '+');
  console.log('RETREIVING: ' + query);
  
  StreamModel.update({}, {live: false}, {multi: true}, function(err, data) {
    if(!err) {
      return console.log("all streams offline");
    } else {
      return console.log(err);
    }
  });
  
  // Get Twitch Stream data
  request(query, function(err, response, body) {
    var twitchJSON = JSON.parse(body);

    twitchJSON.streams.forEach(function(twitchStream) {
      
      var stream = {
        name: twitchStream.channel.display_name,
        streamId: twitchStream.channel.name,
        status: twitchStream.channel.status,
        viewers: twitchStream.viewers,
        preview: twitchStream.preview,
        game: twitchStream.game,
        logo: twitchStream.channel.logo,
        updated_at: twitchStream.channel.updated_at,
        live: true
      };
    
      StreamModel.update( {streamId: stream.streamId}, stream, {upsert: true}, function(err, data) {
        if(!err) {
          return console.log("created:" + stream.name);
        } else {
          return console.log(err);
        }
      });
    });
    res.end("Updated Streams");
  });
});

app.listen(config.port);
console.log('Running Twitch Server on port ' + config.port);