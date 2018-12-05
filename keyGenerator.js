const EC = require('elliptic').ec;
const ec = new EC('secp256k1');         //Algo that is basis of Bitcoin

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log("Private Key: " + privateKey + '\n');
console.log("Public Key: " + publicKey + '\n');