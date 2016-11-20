var express = require('express');
var app = express();
var session = require('cookie-session');
var assert = require('assert');
var mongourl = 'mongodb://localhost:27017/test';

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

app.use(session({
  name: 'session',
  keys: ['a','b'],
  maxAge: 5 * 60 * 1000
}));

app.set('view engine', 'ejs');

app.get("/list", function(req,res) {
  var items = [];
  MongoClient.connect(mongourl, function(err, db) {
    assert.equal(err,null);
    console.log('Connected to MongoDB\n');
    if (typeof req.session.last !== 'number'){
      console.log('nan')
      req.session.last = 0;
    }
    db.collection('items').find().skip(req.session.last * 10).limit(10).toArray(function(err,results) {
      if (err) {
        console.log(err);
      } else {
        db.close();
        console.log('showing: ' + req.session.last + ', no. of records: ' + results.length);
        if(results.length < 10) {
          req.session.last = 0;
        }else{
          req.session.last++;
        }
        res.render('list',{'items':results});
      }
    });
  });
});

app.get("/logout", function(req,res){
  req.session.last = null;
  console.log('logout');
  res.end('logout ok');
});

app.listen(process.env.PORT || 8099);
