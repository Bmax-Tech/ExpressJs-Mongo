var express = require('express');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://127.0.0.1:27017/crash_app";

var app = express();

app.use(cookieParser());
app.use(session({secret: 'keyboard cat'}));

app.set('port', 7890);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extend: false}));

app.get('/', function (req, res) {
    console.log(req.session.last_page);
    req.session.last_page = 'index page';
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        db.collection('cart').find({}).toArray(function (err, result) {
            if (err) throw err;
            db.close();
            res.render('index', {
                items: result
            });
        });
    });
});

app.get('/test', function (req, res) {
    res.send(req.session.last_page);
});

app.post('/addItem', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var data = {
            itemno: req.body.itemno,
            itemname: req.body.itemname,
            qty: req.body.qty
        };
        db.collection('cart').insertOne(data, function (err, result) {
            if (err) throw err;
            console.log('1 record inserted');
            db.close();
            res.redirect('/');
        });
    });
});

app.post('/updateItem', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var query = {
            'itemno': req.body.id
        };
        var new_data = {
            $set: {
                'itemname': req.body.itemname,
                'qty': req.body.qty
            }
        };
        db.collection('cart').updateOne(query, new_data, function (err, results) {
            if (err) throw err;
            console.log(results.result.nModified + ' record updated');
            db.close();
            res.redirect('/');
        });
    });
});

app.get('/delete/:item_no', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var query = {itemno: req.params.item_no};
        db.collection('cart').removeOne(query, function (err, result) {
            if (err) throw err;
            console.log(result.result.n + ' object deleted');
            db.close();
            res.redirect('/');
        });
    });
});

app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));