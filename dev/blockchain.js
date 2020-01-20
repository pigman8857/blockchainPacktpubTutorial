const sha256 = require('sha256');  

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
        amount,sender,recipient
    };
    this.pendingTransactions.push(newTransaction);
    return this.getLastBlock()['index']+1;
}

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

module.exports = Blockchain;