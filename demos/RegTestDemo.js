/**
 * RegTest demo script to be run from project root:
 * # node demos/RegTestDemo.js
 */
'use strict';

const OmniClient = require('../lib/OmniClient.js').OmniClient;
const OmniTestEnvironment = require('../lib/OmniTestEnvironment.js').OmniTestEnvironment;
const fs = require('fs');

const configurationFile = 'configuration.json';
const configuration = JSON.parse(
  fs.readFileSync(configurationFile)
);

console.log("Init client");
const client = new OmniClient({host:'localhost',
  port:18332,
  user: configuration.rpcuser,
  pass: configuration.rpcpassword});

console.log("Init test env");
const testEnv = new OmniTestEnvironment(client);
testEnv.initRegTest();

