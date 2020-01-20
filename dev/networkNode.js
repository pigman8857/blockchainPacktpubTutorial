var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid/v1');
const nodeAddress = uuid().split('-').join('');
const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();
const port = process.argv[2];
const currentNodeUrl = process.argv[3];

// create application/json parser
app.use(bodyParser.json());
// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));


/**
 * 
 * Description. The first endpoint is /blockchain, which allows us to fetch our entire blockchain so that we can look at the data that's inside of it.
 */
app.get('/blockchain', function (req, res) {
    res.send(bitcoin);
});

/**
 * 
 * Description. The second endpoint is /transaction, which allows us to create a new transaction.
 */
app.post('/transaction', function(req, res) {
    const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({ note:`Transaction will be added in block ${blockIndex}.`});
});

/**
 * 
 * Description. The third endpoint is /mine, which will allow us to mine a new block by using the proofOfWork method that we made in the last chapter. 
 * This is going to be a pretty powerful endpoint, and it will be fun to build.
 */
app.get('/mine', function(req, res) {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1
      };
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock = bitcoin.createNewBlock(nonce,previousBlockHash,blockHash);
    bitcoin.pendingTransactions = [];
    bitcoin.createNewTransaction(12.5, "00", nodeAddress);
    res.json({
        note: "New block mined successfully",
        block: newBlock
      });
});

app.listen(port,function(){
    console.log(`listening on port ${port}...`); 
});