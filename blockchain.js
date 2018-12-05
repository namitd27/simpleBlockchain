const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');  

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        //Check if the fromAddress equals the public key
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transaction for other wallets');
        }

        //Sign the hash with the public and private key
        const hashTransaction = this.calculateHash();
        const sign = signingKey.sign(hashTransaction, 'base64');
        this.signature = sign.toDER('hex');     //Special format of the signature
    }

    isValidTransaction(){
        if(this.fromAddress === null){
            return true;
        }

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature for this transaction');
        }

        //Check if the transaction is signed by the correct public key
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = Math.random();
    }

    calculateHash(){
        //SHA256 Hashing, as is in Bitcoin
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty){
        //Implementing Proof of Work
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce = Math.random();
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }

    hasValidTransactions(){
        for(const transaction of this.transactions){
            if(!transaction.isValidTransaction()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;        //Setting difficulty for proof of work
        this.pendingTransactions = [];
        this.miningReward = 50;
    }

    createGenesisBlock(){
        return new Block(new Date(), "Genesis Block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions);        //In reality, you can't give a block all the pending transactions since the block size cannot exceed 1MB
        block.mineBlock(this.difficulty);
        console.log("Block Successfully Mined");
        this.chain.push(block);
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)   //Could you change the miningReward and give yourself more? Sure, but since blockchain resides on a P2P network, other peers will also need to validate this changed reward
        ];
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must have sender or recipient');
        }

        if(!transaction.isValidTransaction()){
            throw new Error('Invalild Transaction');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceFor(address){
        let balance = 0;
        for(const block of this.chain){
            //For each block in the blockchain
            for(const transaction of block.transactions){
                //For each transaction in that block
                if(transaction.fromAddress === address){
                    balance = balance - transaction.amount;
                }
                if(transaction.toAddress === address){
                    balance = balance + transaction.amount;
                }
            }
        }
        return balance;
    }

    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;       //Something went wrong in calculating hash of the block
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;       //Data could be corrupted in one of the blocks
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;