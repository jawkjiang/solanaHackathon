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
var express = require("express");
var session = require("express-session");
var crypto = require("crypto");
var bodyParser = require("body-parser");
var web3 = require("@solana/web3.js");
var anchor = require("@coral-xyz/anchor");
var cors = require("cors");
var dotenv = require("dotenv");
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
var programAddress = process.env.programAddress;
var programId = new web3.PublicKey(programAddress);
var userAddress = '5SJ888Pen6awEvcWNiEopD8RtedFeh3svfj9EajEAZA5';
var TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
var userKey = new web3.PublicKey(userAddress);
// initialize contract connection
var seeds = require('./data/seeds.json');
var connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
var mintPDAs = [];
var _loop_1 = function (i) {
    console.log(Buffer.from(seeds[i], 'utf-8'));
    var mintPDA = web3.PublicKey.findProgramAddressSync([
        Buffer.from(seeds[i])
    ], programId)[0];
    mintPDAs.push(mintPDA);
    var destination = anchor.utils.token.associatedAddress({ mint: mintPDA, owner: userKey });
    var balance = (function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.getTokenAccountBalance(destination)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); })();
    console.log(balance);
};
for (var i = 0; i < seeds.length; i++) {
    _loop_1(i);
}
var test = 1;
