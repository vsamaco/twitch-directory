var application_root = __dirname,
    express = require("express"),
    path = require("path");

var app = express();

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

app.listen(process.env.PORT || 1337);
console.log('Running Twitch Server on port ' + (process.env.PORT || 1337));