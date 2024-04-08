import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as session from 'express-session';
import * as crypto from 'crypto';
import * as bodyParser from 'body-parser';
import * as web3 from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import * as Metaplex from '@metaplex-foundation/js';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';


const app = express();
const secretKey = crypto.randomBytes(64).toString('hex')
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));
declare module 'express-session' {
    interface SessionData {
        userAddress: string;
        userToken: string;
        SOLQuantity: number;
        tokenQuantity: number;
    }
}
app.use(bodyParser.json());
app.use(cors());
const port = 3000;
dotenv.config();

const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
const wallet = new NodeWallet(new web3.Keypair());
const provider = new anchor.AnchorProvider(connection, wallet, {commitment: 'confirmed'});
const programAddress = process.env.programAddress as string;
const programId = new web3.PublicKey(programAddress);
const userAddress = '5SJ888Pen6awEvcWNiEopD8RtedFeh3svfj9EajEAZA5';
const TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
const userKey = new web3.PublicKey(userAddress);
// initialize contract connection
const seeds = require('./data/seeds.json');
const metaplex = new Metaplex.Metaplex(connection);
const idl = require('./data/idl.json');
const program = new anchor.Program(idl, programId, provider);

let mintPDAs: web3.PublicKey[] = [];
let pricePDAs: web3.PublicKey[] = [];
let destinations: web3.PublicKey[] = [];
for (let i = 0; i < seeds.length; i++){
    console.log(Buffer.from(seeds[i], 'utf-8'));
    let [mintPDA] = web3.PublicKey.findProgramAddressSync(
        [   
            Buffer.from(seeds[i])
        ],
        programId);
    mintPDAs.push(mintPDA);
    let [pricePDA] = web3.PublicKey.findProgramAddressSync(
        [   
            Buffer.from(seeds[i] + '-price')
        ],
        programId);
    pricePDAs.push(pricePDA);
    let destination = anchor.utils.token.associatedAddress({mint: mintPDA, owner: userKey});
    destinations.push(destination);
}

console.log(mintPDAs[0]);

const test = process.env.test as unknown as number;

app.get('/test', (req, res) => {
    res.send('Hello World!');
});
    
app.post('/login', async (req, res) => {
    try {
        const { userAddress, userToken } = req.body;
        req.session.userAddress = userAddress;
        req.session.userToken = userToken;
        if (test === 1){
            req.session.SOLQuantity = 10000;
            req.session.tokenQuantity = 1000;
        }
        else {
            const publicKey = new web3.PublicKey(userAddress);
            const SOLQuantity = (await connection.getBalance(publicKey)) / 1000000000;
            let tokenQuantity = 0;
            try {
                tokenQuantity = (await connection.getTokenAccountBalance(destinations[0])).value.uiAmount as number;
            } catch (e) {
                tokenQuantity = 0;
            }
            req.session.SOLQuantity = SOLQuantity;
            req.session.tokenQuantity = tokenQuantity;
        }
        let responseJson = {
            code: 0,
            msg: 'OK',
            data: {
                userAddress: userAddress,
                userToken: userToken,
                assets: [
                    {
                        asset: 'SOL',
                        quantity: req.session.SOLQuantity
                    },
                    {
                        asset: 'Token',
                        quantity: req.session.tokenQuantity
                    }
                ]
            }
        };
        res.json(responseJson);
    }
    catch (e) {
        let responseJson = {
            code: 500,
            msg: e.message
        };
        res.json(responseJson);
    }
});

app.get('/goods', async (req, res) => {
    try {
        if (test === 1){
            const goods = fs.readFileSync('data/goodsTest.json', 'utf-8');
            const goodsList = JSON.parse(goods);
            let responseJson = {
                code: 0,
                msg: 'OK',
                data: goodsList
            };
            res.json(responseJson);
        }
        else {
            const nfts: any[] = []; 
            for (let i = 1; i < mintPDAs.length; i++){
                let nft = await metaplex.nfts().findByMint({ mintAddress: mintPDAs[i] }, { commitment: 'finalized'}) as Metaplex.Nft;
                let raw = await program.account.price.fetch(pricePDAs[i]) as any;
                let parsed = JSON.parse(JSON.stringify(raw))
                let price = parseInt(parsed.price , 16) / 1000000000;
                nfts.push({
                    NFTId: i.toString().padStart(5, '0'),
                    name: nft.json?.name,
                    URL: nft.json?.image,
                    price: price,
                    description: nft.json?.description
                });
                
            }
            let responseJson = {
                code: 0,
                msg: 'OK',
                data: nfts
            };
            res.json(responseJson);
        }
    }   
    catch (e) {
        let responseJson = {
            code: 500,
            msg: e.message
        };
        res.json(responseJson);
    }
});

app.post('/routes', async (req, res) => {
    try {
        interface RequestBody {
            NFTId: string,
            quantity: number
        }
        const reqList: RequestBody[] = req.body;
        console.log(reqList);
        const tokenDiscountPrice = 0.0002;
        let tokenPrice: number;
        if (test === 1){
            tokenPrice = 0.0001;
            req.session.SOLQuantity = 10000;
            req.session.tokenQuantity = 1000;
        }
        // 换成ts，使用anchor
        else {
            tokenPrice = 0.0001;
            req.session.SOLQuantity = (await connection.getBalance(userKey)) / 1000000000;
            req.session.tokenQuantity = (await connection.getTokenAccountBalance(destinations[0])).value.uiAmount as number;
        }
        
        let total = 0;
        // object in reqList: { "NFTId": NFTId, "quantity": quantity }
        for (let i = 0; i < reqList.length; i++){
            let NFTId = reqList[i].NFTId;
            let quantity = reqList[i].quantity;
            console.log(NFTId, quantity);
            let price = 0;
            if (test === 1){
                const goods = fs.readFileSync('data/goodsTest.json', 'utf-8');
                const goodsList = JSON.parse(goods);
                for (let j = 0; j < goodsList.length; j++){
                    if (goodsList[j].NFTId === NFTId){
                        price = goodsList[j].price * quantity;
                        break;
                    }
                }
            }
            else {
                // attention: the backend basically does not store the prices of NFTs, so fetch the price from the blockchain again
                let index = parseInt(NFTId);
                let raw = await program.account.price.fetch(pricePDAs[index]) as any;
                let parsed = JSON.parse(JSON.stringify(raw));
                let perPrice = parseInt(parsed.price , 16) / 1000000000;
                price = perPrice * quantity;
            }
            total += price;
            console.log(total);
        }

        // calculate route0，纯SOL
        // 传NFTId和quantity
        const totalRawPrice0 = total;
        console.log(totalRawPrice0);
        const totalMaxToken = parseInt((totalRawPrice0 / tokenDiscountPrice * 0.3).toFixed(0))
        console.log(totalMaxToken);
        const totalToken0 = 0;
        const tokenToBuy0 = 0;
        const priceBuyingToken0 = 0;
        const totalDiscountPrice0 = 0;
        const totalPrice0 = totalRawPrice0 - totalDiscountPrice0;
        console.log("totalPrice0", totalPrice0);

        // calculate route1，sol和用户账户内积分配合支付
        // 传NFTId和quantity
        const totalRawPrice1 = total;
        console.log(totalRawPrice1);
        let totalToken1;
        if (totalMaxToken < (req.session.tokenQuantity ?? 0)){
            totalToken1 = totalMaxToken;
        }
        else {
            totalToken1 = req.session.tokenQuantity ?? 0;
        }
        const tokenToBuy1 = 0;
        const priceBuyingToken1 = 0;
        const totalDiscountPrice1 = totalToken1 * tokenDiscountPrice;
        const totalPrice1 = totalRawPrice1 - totalDiscountPrice1;

        // calculate route2，sol、用户账户内积分和积分池购买积分配合支付
        // 传NFTId和quantity，以及需要兑换的积分数量
        const totalRawPrice2 = total;
        const totalToken2 = totalMaxToken;
        let tokenToBuy2;
        let priceBuyingToken2;
        let totalDiscountPrice2;
        if (totalMaxToken < (req.session.tokenQuantity ?? 0)){
            tokenToBuy2 = 0;
            priceBuyingToken2 = 0;
            totalDiscountPrice2 = totalMaxToken * tokenDiscountPrice;
        }
        else {
            tokenToBuy2 = totalMaxToken - (req.session.tokenQuantity ?? 0);
            priceBuyingToken2 = tokenToBuy2 * tokenPrice;
            totalDiscountPrice2 = totalMaxToken * tokenDiscountPrice - priceBuyingToken2;
        }
        const totalPrice2 = totalRawPrice2 - totalDiscountPrice2;

        if (totalPrice0 > (req.session.SOLQuantity ?? 0) && totalPrice1 > (req.session.SOLQuantity ?? 0) && totalPrice2 > (req.session.SOLQuantity ?? 0)){
            let responseJson = {
                code: 0,
                msg: 'OK',
                data: {
                    routes: [
                        {
                            route: 0,
                            totalRawPrice: Math.round(totalRawPrice0*1000000000)/1000000000,
                            totalToken: totalToken0,
                            tokenToBuy: tokenToBuy0,
                            priceBuyingToken: Math.round(priceBuyingToken0*1000000000)/1000000000,
                            totalDiscountPrice: Math.round(totalDiscountPrice0*1000000000)/1000000000,
                            totalPrice: Math.round(totalPrice0*1000000000)/1000000000
                        },
                        {
                            route: 1,
                            totalRawPrice: Math.round(totalRawPrice1*1000000000)/1000000000,
                            totalToken: totalToken1,
                            tokenToBuy: tokenToBuy1,
                            priceBuyingToken: Math.round(priceBuyingToken1*1000000000)/1000000000,
                            totalDiscountPrice: Math.round(totalDiscountPrice1*1000000000)/1000000000,
                            totalPrice: Math.round(totalPrice1*1000000000)/1000000000
                        },
                        {
                            route: 2,
                            totalRawPrice: Math.round(totalRawPrice2*1000000000)/1000000000,
                            totalToken: totalToken2,
                            tokenToBuy: tokenToBuy2,
                            priceBuyingToken: Math.round(priceBuyingToken2*1000000000)/1000000000,
                            totalDiscountPrice: Math.round(totalDiscountPrice2*1000000000)/1000000000,
                            totalPrice: Math.round(totalPrice2*1000000000)/1000000000
                        }
                    ]
                }
            };
            res.json(responseJson);
        }
        else {
            let responseJson = {
                code: 0,
                msg: 'OK',
                data: {
                    routes: [
                        {
                            route: 0,
                            totalRawPrice: Math.round(totalRawPrice0*1000000000)/1000000000,
                            totalToken: totalToken0,
                            tokenToBuy: tokenToBuy0,
                            priceBuyingToken: Math.round(priceBuyingToken0*1000000000)/1000000000,
                            totalDiscountPrice: Math.round(totalDiscountPrice0*1000000000)/1000000000,
                            totalPrice: Math.round(totalPrice0*1000000000)/1000000000
                        },
                        {
                            route: 1,
                            totalRawPrice: Math.round(totalRawPrice1*1000000000)/1000000000,
                            totalToken: totalToken1,
                            tokenToBuy: tokenToBuy1,
                            priceBuyingToken: Math.round(priceBuyingToken1*1000000000)/1000000000,
                            totalDiscountPrice: Math.round(totalDiscountPrice1*1000000000)/1000000000,
                            totalPrice: Math.round(totalPrice1*1000000000)/1000000000
                        },
                        {
                            route: 2,
                            totalRawPrice: Math.round(totalRawPrice2*1000000000)/1000000000,
                            totalToken: totalToken2,
                            tokenToBuy: tokenToBuy2,
                            priceBuyingToken: Math.round(priceBuyingToken2*1000000000)/1000000000,
                            totalDiscountPrice: Math.round(totalDiscountPrice2*1000000000)/1000000000,
                            totalPrice: Math.round(totalPrice2*1000000000)/1000000000
                        }
                    ]
                }
            };
            // send response
            console.log(JSON.stringify(responseJson))
            res.json(responseJson);
        };
    }
    catch (e) {
        let responseJson = {
            code: 500,
            msg: e.message
        };
        res.json(responseJson);
    }   
});

app.post('/save', (req, res) => {
    const reqList = req.body;
    for (let i = 0; i < reqList.length; i++){
        const { userAddress, NFTId, quantity, price, token } = reqList[i];
        const timestamp = new Date().getTime();
        const data = {
            userAddress: userAddress,
            NFTId: NFTId,
            quantity: quantity,
            price: price,
            token: token,
            timestamp: timestamp
        };
        const dataString = JSON.stringify(data);
        fs.appendFileSync('data/transactions.json', dataString);
    }
    let responseJson = {
        code: 0,
        msg: 'OK'
    };
    res.json(responseJson);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`,'\n Current time is', new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),'\n Secret key is', secretKey);
});