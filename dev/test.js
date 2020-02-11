const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();
console.log(bitcoin); 


const bc1 = {
    "chain": [
        {
            "index": 1,
            "timeStamp": 1581404974675,
            "transactions": [],
            "nonce": 100,
            "hash": "0",
            "previousBlockHash": "0"
        },
        {
            "index": 2,
            "timeStamp": 1581405047692,
            "transactions": [
                {
                    "amount": 500,
                    "sender": "POIS879AS879AS879AS879",
                    "recipient": "SVAHFI59HFI59HFI59HFI59",
                    "transactionId": "9ac046104c9d11ea8f6117e75aabfa7d"
                }
            ],
            "nonce": 200991,
            "hash": "0000ac30a20f47ba3ff66721007d18830207f82021e7782af20e2b0d35687d00",
            "previousBlockHash": "0"
        },
        {
            "index": 3,
            "timeStamp": 1581405071369,
            "transactions": [
                {
                    "amount": 12.5,
                    "sender": "00",
                    "recipient": "74f65aa04c9d11ea8f6117e75aabfa7d",
                    "transactionId": "a0a5ac504c9d11ea8f6117e75aabfa7d"
                },
                {
                    "amount": 1000,
                    "sender": "POIS879AS879AS879AS879",
                    "recipient": "SVAHFI59HFI59HFI59HFI59",
                    "transactionId": "ab30a5d04c9d11ea8f6117e75aabfa7d"
                },
                {
                    "amount": 1200,
                    "sender": "POIS879AS879AS879AS879",
                    "recipient": "SVAHFI59HFI59HFI59HFI59",
                    "transactionId": "ad88c6a04c9d11ea8f6117e75aabfa7d"
                }
            ],
            "nonce": 61700,
            "hash": "00008ad1a8f7ea6179b361df5dc257d9a60ede591138498cb94cfc2aa63e23e9",
            "previousBlockHash": "0000ac30a20f47ba3ff66721007d18830207f82021e7782af20e2b0d35687d00"
        },
        {
            "index": 4,
            "timeStamp": 1581405709204,
            "transactions": [
                {
                    "amount": 12.5,
                    "sender": "00",
                    "recipient": "74f65aa04c9d11ea8f6117e75aabfa7d",
                    "transactionId": "aec2cd404c9d11ea8f6117e75aabfa7d"
                },
                {
                    "transactionId": "1e0708f04c9f11ea8f6117e75aabfa7d"
                }
            ],
            "nonce": 163231,
            "hash": "0000969bcebd64837389c55b6f8193c81d4b4aed6b1f59dd77e3c542d7a45dda",
            "previousBlockHash": "00008ad1a8f7ea6179b361df5dc257d9a60ede591138498cb94cfc2aa63e23e9"
        }
    ],
    "pendingTransactions": [
        {
            "amount": 12.5,
            "sender": "00",
            "recipient": "74f65aa04c9d11ea8f6117e75aabfa7d",
            "transactionId": "2aef53604c9f11ea8f6117e75aabfa7d"
        }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
};
console.log(bc1);
for (let i = 0; i < bc1.chain.length; i++) {
    let prevBlock = bc1.chain[i-1];
    console.log(prevBlock);
    let currentBlock = bc1.chain[i];
    if(typeof prevBlock !== 'undefined')
        console.log('previousBlockHash =>', prevBlock [ 'hash']);
    console.log('currentBlockHash =>', currentBlock [ 'hash']);
    
}
console.log('VALID:' , bitcoin.chainIsValid(bc1.chain));

