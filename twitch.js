var application_root = __dirname,
    path = require('path'),
    http = require('http'),
    url = require('url'),
    request = require('request'),
    express = require('express');

var app = express();

var config = {
  "elophant_key": "V45wByoYCe2ESQ7h3tnC"
};

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpException: true, showStack: true }));
});

app.get('/api', function(req, res) {
  res.send('Twitch API is running');
});

app.get('/api/streams/:game', function(req, res) {
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

app.listen(process.env.PORT || 1337);
console.log('Running Twitch Server on port ' + (process.env.PORT || 1337));