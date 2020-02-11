const sha256 = require('sha256');  
const port = process.argv[2];
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');

class Blockchain{
    constructor(){
        this.chain = [];
        this.pendingTransactions = [];  
        this.currentNodeUrl = currentNodeUrl;
        this.networkNodes = [];
        this.createNewBlock(100,'0','0');//genesis block
    }

}

Blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash) { 
    const newBlock = {
        index: this.chain.length + 1 ,
        timeStamp :Date.now(),
        transactions: this.pendingTransactions,
        nonce : nonce,
        hash : hash,
        previousBlockHash : previousBlockHash,
    };


    this.pendingTransactions = []; 
    this.chain.push(newBlock);

    return newBlock;
}

Blockchain.prototype.getLastBlock = function () { 
    return this.chain[this.chain.length-1];
}

/** 
* @param amount This parameter will take in the amount of the transaction or how much is being sent in this transaction.
* @param sender This will take in the sender's address.
* @param recipient This will take in the recipient's address.
*/
Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    const newTransaction = {
        amount,
        sender,
        recipient,
        transactionId: uuid().split('-').join('')
    };
    return newTransaction;
}


/** 
* @param transactionObj This parameter will take transaction object created from createNewTransaction.
*/
Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock()['index']+1;
};

/**
 * @param blockdata will be the input data of our block from which we want to generate the hash.  
 */
Blockchain.prototype.hashBlock = function(previousBlockHash,currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString()+ JSON.stringify( currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
}


Blockchain.prototype.proofOfWork = function(previousBlockHash,currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData,nonce);
    while (hash.substring(0, 4) !== '0000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    } 
    return nonce;
}

Blockchain.prototype.chainIsValid = function(blockchain) {
    let validChain = true;
    for (var i = 1; i < blockchain.length; i++) {
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i - 1];
        const blockHash = this.hashBlock (prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] },currentBlock['nonce']);
        if (blockHash.substring(0, 4) !== '0000') 
        {   
            validChain = false; 
            break;
        }
        if (currentBlock['previousBlockHash'] !== prevBlock['hash']) // chain is not valid...
        {   
            validChain = false; 
            break;
        }
    }
    /**
     * we defined the genesis block, we assigned to it values such as nonce, 
     * with a value of 100, previousBlockHash, with a value 0, and the hash of the string 0 as well.
     * genesis block should have no transactions in it.
     */
    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce'] === 100;
    const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
    const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock['transactions'].length === 0;
    if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) 
    { 
        validChain = false;
    }
    return validChain;
}

module.exports = Blockchain;