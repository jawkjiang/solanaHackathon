import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as session from 'express-session';
import * as crypto from 'crypto';
import * as bodyParser from 'body-parser';
import * as web3 from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import * as cors from 'cors';
import * as dotenv from 'dotenv';


const app = express();
const secretKey = crypto.randomBytes(64).toString('hex')
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(cors());
const port = 3000;
dotenv.config();
const { programAddress } = process.env;
const programId = new web3.PublicKey(programAddress);
const userAddress = '5SJ888Pen6awEvcWNiEopD8RtedFeh3svfj9EajEAZA5';
const TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
const userKey = new web3.PublicKey(userAddress);
// initialize contract connection
const seeds = require('./data/seeds.json');
const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
let mintPDAs = [];
for (let i = 0; i < seeds.length; i++){
    console.log(Buffer.from(seeds[i], 'utf-8'));
    let [mintPDA] = web3.PublicKey.findProgramAddressSync(
        [   
            Buffer.from(seeds[i])
        ],
        programId);
    mintPDAs.push(mintPDA);
    let destination = anchor.utils.token.associatedAddress({mint: mintPDA, owner: userKey});
    let balance = (async () => {
        return await connection.getTokenAccountBalance(destination);
    })();
    console.log(balance);
}

const test = 1;