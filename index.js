"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var express = require("express");
var session = require("express-session");
var crypto = require("crypto");
var bodyParser = require("body-parser");
var web3 = require("@solana/web3.js");
var anchor = require("@coral-xyz/anchor");
var Metaplex = require("@metaplex-foundation/js");
var cors = require("cors");
var dotenv = require("dotenv");
var nodewallet_1 = require("@coral-xyz/anchor/dist/cjs/nodewallet");
var app = express();
var secretKey = crypto.randomBytes(64).toString('hex');
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(cors());
var port = 3000;
dotenv.config();
var connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
var wallet = new nodewallet_1.default(new web3.Keypair());
var provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
var programAddress = process.env.programAddress;
var programId = new web3.PublicKey(programAddress);
var userAddress = '5SJ888Pen6awEvcWNiEopD8RtedFeh3svfj9EajEAZA5';
var TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
var userKey = new web3.PublicKey(userAddress);
// initialize contract connection
var seeds = require('./data/seeds.json');
var metaplex = new Metaplex.Metaplex(connection);
var idl = require('./data/idl.json');
var program = new anchor.Program(idl, programId, provider);
var mintPDAs = [];
var pricePDAs = [];
var destinations = [];
for (var i = 0; i < seeds.length; i++) {
    console.log(Buffer.from(seeds[i], 'utf-8'));
    var mintPDA = web3.PublicKey.findProgramAddressSync([
        Buffer.from(seeds[i])
    ], programId)[0];
    mintPDAs.push(mintPDA);
    var pricePDA = web3.PublicKey.findProgramAddressSync([
        Buffer.from(seeds[i] + '-price')
    ], programId)[0];
    pricePDAs.push(pricePDA);
    var destination = anchor.utils.token.associatedAddress({ mint: mintPDA, owner: userKey });
    destinations.push(destination);
}
console.log(mintPDAs[0]);
var test = process.env.test;
app.get('/test', function (req, res) {
    res.send('Hello World!');
});
app.post('/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userAddress_1, userToken, publicKey, SOLQuantity, tokenQuantity, e_1, responseJson, e_2, responseJson;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                _a = req.body, userAddress_1 = _a.userAddress, userToken = _a.userToken;
                req.session.userAddress = userAddress_1;
                req.session.userToken = userToken;
                if (!(test === 1)) return [3 /*break*/, 1];
                req.session.SOLQuantity = 10000;
                req.session.tokenQuantity = 1000;
                return [3 /*break*/, 7];
            case 1:
                publicKey = new web3.PublicKey(userAddress_1);
                return [4 /*yield*/, connection.getBalance(publicKey)];
            case 2:
                SOLQuantity = (_b.sent()) / 1000000000;
                tokenQuantity = 0;
                _b.label = 3;
            case 3:
                _b.trys.push([3, 5, , 6]);
                return [4 /*yield*/, connection.getTokenAccountBalance(destinations[0])];
            case 4:
                tokenQuantity = (_b.sent()).value.uiAmount;
                return [3 /*break*/, 6];
            case 5:
                e_1 = _b.sent();
                tokenQuantity = 0;
                return [3 /*break*/, 6];
            case 6:
                req.session.SOLQuantity = SOLQuantity;
                req.session.tokenQuantity = tokenQuantity;
                _b.label = 7;
            case 7:
                responseJson = {
                    code: 0,
                    msg: 'OK',
                    data: {
                        userAddress: userAddress_1,
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
                return [3 /*break*/, 9];
            case 8:
                e_2 = _b.sent();
                responseJson = {
                    code: 500,
                    msg: e_2.message
                };
                res.json(responseJson);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
app.get('/goods', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var goods, goodsList, responseJson, nfts, i, nft, raw, parsed, price, responseJson, e_3, responseJson;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 8, , 9]);
                if (!(test === 1)) return [3 /*break*/, 1];
                goods = fs.readFileSync('data/goodsTest.json', 'utf-8');
                goodsList = JSON.parse(goods);
                responseJson = {
                    code: 0,
                    msg: 'OK',
                    data: goodsList
                };
                res.json(responseJson);
                return [3 /*break*/, 7];
            case 1:
                nfts = [];
                i = 1;
                _d.label = 2;
            case 2:
                if (!(i < mintPDAs.length)) return [3 /*break*/, 6];
                return [4 /*yield*/, metaplex.nfts().findByMint({ mintAddress: mintPDAs[i] }, { commitment: 'finalized' })];
            case 3:
                nft = _d.sent();
                return [4 /*yield*/, program.account.price.fetch(pricePDAs[i])];
            case 4:
                raw = _d.sent();
                parsed = JSON.parse(JSON.stringify(raw));
                price = parseInt(parsed.price, 16) / 1000000000;
                nfts.push({
                    NFTId: i.toString().padStart(5, '0'),
                    name: (_a = nft.json) === null || _a === void 0 ? void 0 : _a.name,
                    URL: (_b = nft.json) === null || _b === void 0 ? void 0 : _b.image,
                    price: price,
                    description: (_c = nft.json) === null || _c === void 0 ? void 0 : _c.description
                });
                _d.label = 5;
            case 5:
                i++;
                return [3 /*break*/, 2];
            case 6:
                responseJson = {
                    code: 0,
                    msg: 'OK',
                    data: nfts
                };
                res.json(responseJson);
                _d.label = 7;
            case 7: return [3 /*break*/, 9];
            case 8:
                e_3 = _d.sent();
                responseJson = {
                    code: 500,
                    msg: e_3.message
                };
                res.json(responseJson);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
app.post('/routes', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var reqList, tokenDiscountPrice, tokenPrice, _a, _b, total, i, NFTId, quantity, price, goods, goodsList, j, index, raw, parsed, perPrice, totalRawPrice0, totalMaxToken, totalToken0, tokenToBuy0, priceBuyingToken0, totalDiscountPrice0, totalPrice0, totalRawPrice1, totalToken1, tokenToBuy1, priceBuyingToken1, totalDiscountPrice1, totalPrice1, totalRawPrice2, totalToken2, tokenToBuy2, priceBuyingToken2, totalDiscountPrice2, totalPrice2, responseJson, responseJson, e_4, responseJson;
    var _c, _d, _e, _f, _g, _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                _k.trys.push([0, 11, , 12]);
                reqList = req.body;
                console.log(reqList);
                tokenDiscountPrice = 0.0002;
                tokenPrice = void 0;
                if (!(test === 1)) return [3 /*break*/, 1];
                tokenPrice = 0.0001;
                req.session.SOLQuantity = 10000;
                req.session.tokenQuantity = 1000;
                return [3 /*break*/, 4];
            case 1:
                tokenPrice = 0.0001;
                _a = req.session;
                return [4 /*yield*/, connection.getBalance(userKey)];
            case 2:
                _a.SOLQuantity = (_k.sent()) / 1000000000;
                _b = req.session;
                return [4 /*yield*/, connection.getTokenAccountBalance(destinations[0])];
            case 3:
                _b.tokenQuantity = (_k.sent()).value.uiAmount;
                _k.label = 4;
            case 4:
                total = 0;
                i = 0;
                _k.label = 5;
            case 5:
                if (!(i < reqList.length)) return [3 /*break*/, 10];
                NFTId = reqList[i].NFTId;
                quantity = reqList[i].quantity;
                console.log(NFTId, quantity);
                price = 0;
                if (!(test === 1)) return [3 /*break*/, 6];
                goods = fs.readFileSync('data/goodsTest.json', 'utf-8');
                goodsList = JSON.parse(goods);
                for (j = 0; j < goodsList.length; j++) {
                    if (goodsList[j].NFTId === NFTId) {
                        price = goodsList[j].price * quantity;
                        break;
                    }
                }
                return [3 /*break*/, 8];
            case 6:
                index = parseInt(NFTId);
                return [4 /*yield*/, program.account.price.fetch(pricePDAs[index])];
            case 7:
                raw = _k.sent();
                parsed = JSON.parse(JSON.stringify(raw));
                perPrice = parseInt(parsed.price, 16) / 1000000000;
                price = perPrice * quantity;
                _k.label = 8;
            case 8:
                total += price;
                console.log(total);
                _k.label = 9;
            case 9:
                i++;
                return [3 /*break*/, 5];
            case 10:
                totalRawPrice0 = total;
                console.log(totalRawPrice0);
                totalMaxToken = parseInt((totalRawPrice0 / tokenDiscountPrice * 0.3).toFixed(0));
                console.log(totalMaxToken);
                totalToken0 = 0;
                tokenToBuy0 = 0;
                priceBuyingToken0 = 0;
                totalDiscountPrice0 = 0;
                totalPrice0 = totalRawPrice0 - totalDiscountPrice0;
                console.log("totalPrice0", totalPrice0);
                totalRawPrice1 = total;
                console.log(totalRawPrice1);
                totalToken1 = void 0;
                if (totalMaxToken < ((_c = req.session.tokenQuantity) !== null && _c !== void 0 ? _c : 0)) {
                    totalToken1 = totalMaxToken;
                }
                else {
                    totalToken1 = (_d = req.session.tokenQuantity) !== null && _d !== void 0 ? _d : 0;
                }
                tokenToBuy1 = 0;
                priceBuyingToken1 = 0;
                totalDiscountPrice1 = totalToken1 * tokenDiscountPrice;
                totalPrice1 = totalRawPrice1 - totalDiscountPrice1;
                totalRawPrice2 = total;
                totalToken2 = totalMaxToken;
                tokenToBuy2 = void 0;
                priceBuyingToken2 = void 0;
                totalDiscountPrice2 = void 0;
                if (totalMaxToken < ((_e = req.session.tokenQuantity) !== null && _e !== void 0 ? _e : 0)) {
                    tokenToBuy2 = 0;
                    priceBuyingToken2 = 0;
                    totalDiscountPrice2 = totalMaxToken * tokenDiscountPrice;
                }
                else {
                    tokenToBuy2 = totalMaxToken - ((_f = req.session.tokenQuantity) !== null && _f !== void 0 ? _f : 0);
                    priceBuyingToken2 = tokenToBuy2 * tokenPrice;
                    totalDiscountPrice2 = totalMaxToken * tokenDiscountPrice - priceBuyingToken2;
                }
                totalPrice2 = totalRawPrice2 - totalDiscountPrice2;
                if (totalPrice0 > ((_g = req.session.SOLQuantity) !== null && _g !== void 0 ? _g : 0) && totalPrice1 > ((_h = req.session.SOLQuantity) !== null && _h !== void 0 ? _h : 0) && totalPrice2 > ((_j = req.session.SOLQuantity) !== null && _j !== void 0 ? _j : 0)) {
                    responseJson = {
                        code: 0,
                        msg: 'OK',
                        data: {
                            routes: [
                                {
                                    route: 0,
                                    totalRawPrice: Math.round(totalRawPrice0 * 1000000000) / 1000000000,
                                    totalToken: totalToken0,
                                    tokenToBuy: tokenToBuy0,
                                    priceBuyingToken: Math.round(priceBuyingToken0 * 1000000000) / 1000000000,
                                    totalDiscountPrice: Math.round(totalDiscountPrice0 * 1000000000) / 1000000000,
                                    totalPrice: Math.round(totalPrice0 * 1000000000) / 1000000000
                                },
                                {
                                    route: 1,
                                    totalRawPrice: Math.round(totalRawPrice1 * 1000000000) / 1000000000,
                                    totalToken: totalToken1,
                                    tokenToBuy: tokenToBuy1,
                                    priceBuyingToken: Math.round(priceBuyingToken1 * 1000000000) / 1000000000,
                                    totalDiscountPrice: Math.round(totalDiscountPrice1 * 1000000000) / 1000000000,
                                    totalPrice: Math.round(totalPrice1 * 1000000000) / 1000000000
                                },
                                {
                                    route: 2,
                                    totalRawPrice: Math.round(totalRawPrice2 * 1000000000) / 1000000000,
                                    totalToken: totalToken2,
                                    tokenToBuy: tokenToBuy2,
                                    priceBuyingToken: Math.round(priceBuyingToken2 * 1000000000) / 1000000000,
                                    totalDiscountPrice: Math.round(totalDiscountPrice2 * 1000000000) / 1000000000,
                                    totalPrice: Math.round(totalPrice2 * 1000000000) / 1000000000
                                }
                            ]
                        }
                    };
                    res.json(responseJson);
                }
                else {
                    responseJson = {
                        code: 0,
                        msg: 'OK',
                        data: {
                            routes: [
                                {
                                    route: 0,
                                    totalRawPrice: Math.round(totalRawPrice0 * 1000000000) / 1000000000,
                                    totalToken: totalToken0,
                                    tokenToBuy: tokenToBuy0,
                                    priceBuyingToken: Math.round(priceBuyingToken0 * 1000000000) / 1000000000,
                                    totalDiscountPrice: Math.round(totalDiscountPrice0 * 1000000000) / 1000000000,
                                    totalPrice: Math.round(totalPrice0 * 1000000000) / 1000000000
                                },
                                {
                                    route: 1,
                                    totalRawPrice: Math.round(totalRawPrice1 * 1000000000) / 1000000000,
                                    totalToken: totalToken1,
                                    tokenToBuy: tokenToBuy1,
                                    priceBuyingToken: Math.round(priceBuyingToken1 * 1000000000) / 1000000000,
                                    totalDiscountPrice: Math.round(totalDiscountPrice1 * 1000000000) / 1000000000,
                                    totalPrice: Math.round(totalPrice1 * 1000000000) / 1000000000
                                },
                                {
                                    route: 2,
                                    totalRawPrice: Math.round(totalRawPrice2 * 1000000000) / 1000000000,
                                    totalToken: totalToken2,
                                    tokenToBuy: tokenToBuy2,
                                    priceBuyingToken: Math.round(priceBuyingToken2 * 1000000000) / 1000000000,
                                    totalDiscountPrice: Math.round(totalDiscountPrice2 * 1000000000) / 1000000000,
                                    totalPrice: Math.round(totalPrice2 * 1000000000) / 1000000000
                                }
                            ]
                        }
                    };
                    // send response
                    console.log(JSON.stringify(responseJson));
                    res.json(responseJson);
                }
                ;
                return [3 /*break*/, 12];
            case 11:
                e_4 = _k.sent();
                responseJson = {
                    code: 500,
                    msg: e_4.message
                };
                res.json(responseJson);
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); });
app.post('/save', function (req, res) {
    var reqList = req.body;
    for (var i = 0; i < reqList.length; i++) {
        var _a = reqList[i], userAddress_2 = _a.userAddress, NFTId = _a.NFTId, quantity = _a.quantity, price = _a.price, token = _a.token;
        var timestamp = new Date().getTime();
        var data = {
            userAddress: userAddress_2,
            NFTId: NFTId,
            quantity: quantity,
            price: price,
            token: token,
            timestamp: timestamp
        };
        var dataString = JSON.stringify(data);
        fs.appendFileSync('data/transactions.json', dataString);
    }
    var responseJson = {
        code: 0,
        msg: 'OK'
    };
    res.json(responseJson);
});
app.listen(port, function () {
    console.log("Server is running at http://localhost:".concat(port), '\n Current time is', new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }), '\n Secret key is', secretKey);
});
