var express = require('express');
var app = express();
const bodyParser = require('body-parser');

// create application/json parser
app.use(bodyParser.json());
// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));


/**
 * 
 * Description. The first endpoint is /blockchain, which allows us to fetch our entire blockchain so that we can look at the data that's inside of it.
 */
app.get('/blockchain', function (req, res) {

});

/**
 * 
 * Description. The second endpoint is /transaction, which allows us to create a new transaction.
 */
app.post('/transaction', function(req, res) {
    console.log(req.body);
    res.send(`The amount of the transaction is ${req.body.amount} bitcoin.`);
});

/**
 * 
 * Description. The third endpoint is /mine, which will allow us to mine a new block by using the proofOfWork method that we made in the last chapter. 
 * This is going to be a pretty powerful endpoint, and it will be fun to build.
 */
app.get('/mine', function(req, res) {

});

app.listen(3000,function(){
    console.log('listening on port 3000...'); 
});