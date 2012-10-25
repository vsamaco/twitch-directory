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

var Stream = new Schema({
  name: String,
  streamId: String,
  summonerName: String,
  status: String,
  viewers: Number,
  preview: String,
  game: String,
  logo: String,
  updated_at: String
});

var StreamModel = db.model('Stream', Stream);



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
  return StreamModel.find(function(err, streams) {
    if(!err) {
      return res.send(streams);
    } else {
      return console.log(err);
    }
  })
});

app.get('/api/stream/:name', function(req, res) {
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
  
  request(query).pipe(res);
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
        updated_at: twitchStream.channel.updated_at
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