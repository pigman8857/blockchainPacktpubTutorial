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
 * This endpoint work after
 */
app.post('/transaction', function(req, res) {
    const newTransaction = req.body;
    const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
    res.json({ note: `Transaction will be added in block ${blockIndex}.`});
});

/**
 * 
 * Description. Allows us to broadcast transaction to other nodes in our network.
 */
app.post('/transaction/broadcast', function(req, res)   {
    const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionToPendingTransactions (newTransaction);
    const requestPromises = []; 
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises).then(data => {
        res.json({ note: 'Transaction created and broadcast successfully.'})
    });
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
    const requestPromises = [];
    bitcoin.pendingTransactions = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        };
        requestPromises.push(rp(requestOptions));
    })
    Promise.all(requestPromises).then(data => {
        const requestOptions = {
            uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body: {
                amount: 12.5, 
                sender:"00", 
                recipient: nodeAddress
            },
            json: true
        };  
        return rp(requestOptions);
    })
    res.json({
        note: "New block mined successfully",
        block: newBlock
    });
      
});

app.post('/receive-new-block', function(req, res) {
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock(); 
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
    if (correctHash && correctIndex) {
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];
        res.json({
            note: 'New block received and accepted.',
            newBlock: newBlock
        })
    }
    else{
        res.json({
            note:'New block rejected.',
            newBlock: newBlock
        }); 
    }
});

/**
 * The preceding endpoint will register a node and broadcast that node to the whole network. 
 * It will do this by passing the URL of the node we want to register on the req body. 
 * 
 */
app.post('/register-and-broadcast-node', function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    const notTheCurrentNode = newNodeUrl !== bitcoin.currentNodeUrl;
    if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1 && notTheCurrentNode){
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
    else{
        res.json({ note: 'you are trying to add exiting node.' });
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

app.get('/consensus', function(req, res) { 
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true 
        }
        requestPromises.push(rp(requestOptions));
    });  
    Promise.all(requestPromises).then(blockchains => {
        const currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;
        blockchains.forEach(blockchain => {        
            /*
            *If there is a chain that longer that our current chain, it means this chain is newer 
            *so we have to update our chain with the longer one.        
            */
            if (blockchain.chain.length > maxChainLength) {
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions;
            };
        });

        if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) 
        {
            //No chain to update
            res.json({
                note: 'Current chain has not been replaced.',
                chain: bitcoin.chain
            });
        }else {
            //update chain
            bitcoin.chain = newLongestChain;
            bitcoin.pendingTransactions = newPendingTransactions;
            res.json({
                          note: 'This chain has been replaced.',
                          chain: bitcoin.chain
            });
   }
    });
});

/**
 * A specific blockHash will be sent with this endpoint, which, as a result, 
 * will simply return to us the block that the input of blockHash corresponds to.
 */
app.get('/block/:blockHash', function(req, res) { 
    const blockHash = req.params.blockHash;
    const correctBlock = bitcoin.getBlock(blockHash);
    res.json({
        block: correctBlock
    });
});

/**
 * With this endpoint, send a transactionId, and in the response, 
 * we should expect to get the correct transaction that this ID corresponds to.
 */
app.get('/transaction/:transactionId', function(req, res) {
    const transactionId = req.params.transactionId;
    const transactionData = bitcoin.getTransaction(transactionId);
    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block
    });   
});

/**
 * With this endpoint, we'll send a specific address, and in response, 
 * you should expect to get all of the transactions that correspond to this address—every time 
 * this specific address has either sent or received Bitcoin—in response. 
 * you'll also get to know the current balance of this address, 
 * which is how many Bitcoins this address currently owns.
 */
app.get('/address/:address', function(req, res) {
    const address = req.params.address;
    const addressData = bitcoin.getAddressData(address);
    res.json({
        addressData: addressData
    });
});

app.get('/block-explorer', function(req, res) {
    res.sendFile('./block-explorer/index.html', { root: __dirname });
});

app.listen(port,function(){
    console.log(`listening on port ${port}...`); 
});