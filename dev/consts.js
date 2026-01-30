const fs = require('fs');
const util = require('util');
const chalk = require('chalk');
const moment = require('moment-timezone');
const pino = require('pino');
const logger = pino({ level: 'debug' });
const crypto = require('crypto');
const path = require('path');
const readline = require('readline');
const yargs = require('yargs/yargs');
const _ = require('lodash');
const { Boom } = require('@hapi/boom');

const {
  default: makeWASocket,
  generateWAMessageFromContent,
  getAggregateVotesInPollMessage,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  useMultiFileAuthState,
  generateWAMessage,
  DisconnectReason,
  areJidsSameUser,
  getContentType,
  decryptPollVote,
  relayMessage,
  jidDecode,
  makeInMemoryStore,
  Browsers,
  proto
} = require('@whiskeysockets/baileys');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const store = makeInMemoryStore({
  logger: pino().child({ level: 'silent', stream: 'store' })
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (text) => new Promise(resolve => rl.question(text, resolve));

module.exports = {
  fs,
  util,
  chalk,
  moment,
  pino,
  logger,
  crypto,
  path,
  readline,
  yargs,
  _,
  Boom,
  sleep,
  store,
  rl,
  question,
  makeWASocket,
  generateWAMessageFromContent,
  getAggregateVotesInPollMessage,
  downloadContentFromMessage,
  prepareWAMessageMedia,
  useMultiFileAuthState,
  generateWAMessage,
  DisconnectReason,
  areJidsSameUser,
  getContentType,
  decryptPollVote,
  relayMessage,
  jidDecode,
  makeInMemoryStore,
  Browsers,
  proto
};


let file = require.resolve(__filename);
let reloadTimeout = null;
fs.watchFile(file, () => {
  if (reloadTimeout) clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(() => {
    fs.unwatchFile(file);
    console.log(`Update ${__filename}`);
    delete require.cache[file];
    require(file);
  }, 500);
});
