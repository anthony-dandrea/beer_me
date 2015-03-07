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

// Send request to both APIs simutaneously
// Use promise to return upon both requests resolving
function getResults(beer) {
    var untappdEndpoint = 'https://api.untappd.com/v4/search/beer?client_id=' + secrets.utdIdKey + '&client_secret=' + secrets.utdSecretKey + '&q=' + encodeURIComponent(beer);
    return Q.all([Q.nfcall(request, brewerydbEndpoint),
                  Q.nfcall(request, untappdEndpoint)])
    .spread(function(brewerydbRes, untappdRes) {
        return [brewerydbRes[1], untappdRes[1]];  // return the response body
    })
    .fail(function(err) {
        console.error('error:',err);
        return err;
    });
}

app.post('/api/v1/beers', function(req, res, next) {
    // Construct the brewerydb endpoint to hit
    var beer = req.body.beer
    if (req.body.mock) {
        if (beer == 'no_beer') {
            var resp = {'breweryDB': brewdbMock.noBeer,
                        'untappd': untappdMock}
            res.send(JSON.stringify(resp));
        } else if (beer == 'no_image') {
            var resp = {'breweryDB': brewdbMock.noImage,
                        'untappd': untappdMock}
            res.send(JSON.stringify(resp));
        } else {
            var resp = {'breweryDB': brewdbMock.oneBeer,
                        'untappd': untappdMock}
            res.send(JSON.stringify(resp));
        }
    }
    else {
        getResults(beer).then(function(responses) {
            var bdbResp = responses[0]
            var utResp = responses[1]
            var resp = {'breweryDB': bdbApi.parseResp(beer, bdbResp),
                        'untappd': utdApi.parseResp(beer, utResp)};
            // I'm pretty fucking sure utdApi.parseResp()
            // Isn't resolving before fucking res.send()
            // Asyncing right up my ass
            debugger;
            res.send(JSON.stringify(resp));
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
