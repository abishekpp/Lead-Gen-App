/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');
require('dotenv').config();

const verify_token = process.env.APP_VERIFY_TOKEN;
const port = process.env.PORT || 5000;
const appId =  process.env.APP_ID;
const appSecret = process.env.APP_SECRET;
const verifyToken = process.env.VERIFY_TOKEN;
const appAccessToken = process.env.APP_ACCESS_TOKEN;
const appCallbackUrl = process.env.APP_CALLBACK_URL;

app.set('port', (port));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

const received_updates = [];

app.get('/', function(req, res) {
  console.log(req);
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get('/facebook', function(req, res) {
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == verify_token
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

// SET UP WEBHOOK
// const appId =  process.env.APP_ID;
// const appAccessToken = process.env.APP_ACCESS_TOKEN;
// const webhookConfig = {
//   object: 'page', // Replace with 'user' if you want to subscribe to user updates
//   callback_url: process.env.APP_CALLBACK_URL,
//   fields: 'about,picture', // Replace with the fields you want to subscribe to
//   include_values: true,
//   verify_token: process.env.APP_VERIFY_TOKEN
// };

// const postWebhookSubscription = async () => {
//   try {
//     const response = await axios.post(
//       `https://graph.facebook.com/v20.0/${appId}/subscriptions`,
//       null, // POST data is sent in query params, not the body
//       {
//         params: webhookConfig,
//         headers: {
//           'Authorization': `Bearer ${appAccessToken}`
//         }
//       }
//     );

//     console.log('Response:', response.data);
//   } catch (error) {
//     console.error('Error:', error.response ? error.response.data : error.message);
//   }
// };

// postWebhookSubscription();

app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});


// setInterval(() => {
//   console.log(received_updates);
// }, 5000);

app.listen((address, error)=>{
  console.log("Server started on port"+ 5000);
});
