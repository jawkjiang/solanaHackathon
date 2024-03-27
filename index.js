const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const { Connection, PublicKey } = require('@solana/web3.js');

const filePath = path.join(__dirname, '/data/NFTs.json')
const data = fs.readFileSync(filePath, 'utf8');
const NFTRules = JSON.parse(data);

const app = express();
const secretKey = crypto.randomBytes(64).toString('hex')
app.use(session({
    secret: secretKey,
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json());
const port = 80;

app.post('/login', (req, res) => {
    try {
        const { userToken } = req.body;
        req.session.userToken = userToken;
        res.send('{ "code": 0, "msg": "OK" }');
    }
    catch (e) {
        res.send(`{ "code": 500, "msg": ${e.message} }`);
    }
});

app.post('/routes', (req, res) => {
    try {
        const { NFTId, price, SOLQuantity, tokenQuantity } = req.body;
        const connection = new Connection('https://api.devnet.solana.com');
        const NFTAddress = NFTRules[NFTId];
        const publicKey = new PublicKey(NFTAddress);
        // get the consumeRule of the NFT
        (async () => {
            // rule is a number indicating how much token can be used to purchase one NFT once at most
            const rule = await connection.getAccountInfo(publicKey).data;
            const tokenPrice = await connection.getAccountInfo('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx').data;
            if (rule < tokenQuantity){
                const priceRoute1 = price - tokenPrice * rule;
                const priceRoute2 = price - tokenPrice * rule;
            }
            else{
                const priceRoute1 = price - tokenPrice * tokenQuantity;
                const priceRoute2 = price - tokenPrice * rule + tokenPrice * (rule - tokenQuantity);
            }
            if (SOLQuantity >= price && priceRoute1 >= 0 && priceRoute2 >= 0){
                const routesList = [
                    {
                        route: 0,
                        price: price
                    },
                    {
                        route: 1,
                        price: priceRoute1 
                    },
                    {
                        route: 2,
                        price: priceRoute2
                    }
                ];
                res.send({ "code": 0, "msg": "OK", "data": routesList });
            }
            else{
                res.send({ "code": 400, "msg": "Insufficient balance" });
            }
        })();
    }
    catch (e) {
        res.send(`{ "code": 500, "msg": ${e.message} }`);
    }
});

app.post('/save', (req, res) => {
    const { userAddress, price, quantity } = req.body;
    const timestamp = new Date().getTime();
    const data = {
        userAddress: userAddress,
        price: price,
        quantity: quantity,
        timestamp: timestamp
    };
    const dataString = JSON.stringify(data);
    fs.appendFileSync('data/transactions.json', dataString);
    res.send('{ "code": 0, "msg": "OK" }');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`,'\n Current time is', new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),'\n Secret key is', secretKey);
});
        
