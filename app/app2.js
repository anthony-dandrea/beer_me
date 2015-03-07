// Import Libraries
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();

// Import Routes
var routes = require('./routes/index');
var users = require('./routes/users');
// Import Secrets & PWW API Modules
var secrets = require('./secrets');
var utdApi = require('./api/untappd');

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');


app.use(favicon('./public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/../public')));

app.use('/', routes);
app.use('/users', users);

app.post('/api/v1/beers', function(req, res, next) {
  var body = req.body;
  if (!body.location) {
    // Just do the one call for the beer search
    // and send FE result
    utdApi.parseBeerResp(body).then(function(beerResponse){
      res.send(JSON.stringify(beerResponse));
    });
  } else {
    // Do two synchronous blocking calls
    // for the beer to get info and bid
    // then a 2nd for the venue
    utdApi.parseBeerResp(body).then(function(beerResponse) {
      utdApi.parseVenueResp(body, beerResponse.bid).then(function(venueResponse){
        console.log(beerResponse); // hopefully still have this in child scope
        var resp = beerResponse.venue = (venueResponse); // add venue to response
        console.log(resp);
        res.send(JSON.stringify(resp));
      });
    });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
