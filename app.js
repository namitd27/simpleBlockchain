const {Blockchain, Transaction} = require('./Blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const myKey = ec.keyFromPrivate('daf96a47875ddfa56adc57edcff22ddf1ae16ea83049570ecae536f2faa57ff8');
const myWalletAddress = myKey.getPublic('hex');

let ndCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'Public Key Here', 100);
tx1.signTransaction(myKey);
ndCoin.addTransaction(tx1);

console.log("Starting the mining process...");
ndCoin.minePendingTransactions(myWalletAddress);
console.log("My Balance : " + ndCoin.getBalanceFor(myWalletAddress));
ndCoin.minePendingTransactions(myWalletAddress);
console.log("My Balance : " + ndCoin.getBalanceFor(myWalletAddress));