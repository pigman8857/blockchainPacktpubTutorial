const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

const previousBlockHash = '87765DA6CCF0668238C1D27C35692E11';
const currentBlockData = [
    {
        amount: 10,
        sender: 'B4CEE9C0E5CD571',
        recipient: '3A3F6E462D48E9',  
    },
    {
        amount: 20,
        sender: 'B4CEE9C0E5JW48B',
        recipient: '3A3F6E462D48E9',  
    },
    {
        amount: 30,
        sender: 'B4CEE9C0E5CD571',
        recipient: '3A3F6E462AR8I5',  
    }  
];
const nonce = 43237;//bitcoin.proofOfWork(previousBlockHash, currentBlockData);//43237
console.log(nonce);
console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce));
//console.log(bitcoin.proofOfWork(previousBlockHash, currentBlockData));
//console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce ));
/*
bitcoin.createNewBlock(789457,'OIUOEDJETH8754DHKD','78SHNEG45DER56');
bitcoin.createNewTransaction(100,'ALEXHT845SJ5TKCJ2','JENN5BG5DF6HT8NG9');
bitcoin.createNewBlock(548764,'AKMC875E6S1RS9','WPLS214R7T6SJ3G2');
bitcoin.createNewTransaction(100,'ALEXHT845SJ5TKCJ2','JENN5BG5DF6HT8NG9');
bitcoin.createNewTransaction(100,'ALEXHT845SJ5TKCJ2','JENN5BG5DF6HT8NG9');
bitcoin.createNewTransaction(100,'ALEXHT845SJ5TKCJ2','JENN5BG5DF6HT8NG9');
bitcoin.createNewBlock(548764,'AKMC875E6S1RS9','WPLS214R7T6SJ3G2');
*/
console.log(bitcoin); 