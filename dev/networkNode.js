var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid/v1');
const nodeAddress = uuid().split('-').join('');
const Blockchain = require('./blockchain');
const rp = require('request-promise');
const bitcoin = new Blockchain();
const port = process.argv[2];


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

/**
 * The preceding endpoint will register a node and broadcast that node to the whole network. 
 * It will do this by passing the URL of the node we want to register on the req body. 
 * 
 */
app.post('/register-and-broadcast-node', function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1){
        const regNodesPromises = [];
        bitcoin.networkNodes.forEach(networkNodeUrl => {
            //... '/register-node' 
            const requestOptions = {
                uri: networkNodeUrl +'/register-node',
                method:'POST',
                body: { newNodeUrl: newNodeUrl },
                json: true
            };
            regNodesPromises.push(rp(requestOptions));
        });
        Promise.all(regNodesPromises)
        .then(data => {
            //use the data...
            const bulkRegisterOptions = { 
                uri: newNodeUrl + '/register-nodes-bulk',
                method: 'POST',
                        body: {allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]} ,
                        json:true
            }; 
            return rp(bulkRegisterOptions).then (data => {
                res.json({ note: 'New Node registered with network successfully' });
            });
        });
        bitcoin.networkNodes.push(newNodeUrl);  
    }
       
});

app.post('/register-node', function (req, res) {

    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = 
        bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;

    if (nodeNotAlreadyPresent && notCurrentNode){
        bitcoin.networkNodes.push(newNodeUrl);
    }
    res.json({ note:'New node registered successfully.' });

});

app.post('/register-nodes-bulk', function (req, res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => { 
        const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = bitcoin.currentNodeUrl !==networkNodeUrl
        if(nodeNotAlreadyPresent && notCurrentNode){
            bitcoin.networkNodes.push(networkNodeUrl);
        }
    });
    res.json({note: 'Bulk registration successful.' });
});

app.listen(port,function(){
    console.log(`listening on port ${port}...`); 
});