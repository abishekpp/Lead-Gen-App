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
const pageAccessToken = process.env.PAGE_ACCESS_TOKEN;

app.set('port', (port));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

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
    console.log("Web hook is set up");
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

const received_updates = [];
const leadData = [];

function processUpdates() {
  for(const update of received_updates) {
    for(const entry of update.entry) {
      for(const change of entry.changes) {
        const lead ={
          leadgenId: change.value.leadgen_id,
          pageId: change.value.page_id
        }
        leadData.push(lead);
        console.log(change);
      }
    }
  }
}

// Graph api for retrive lead details
async function fetchLeadData(leadgenId, accessToken) {
  const url = `https://graph.facebook.com/v20.0/${leadgenId}?access_token=${accessToken}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching lead data:', error);
    return null;
  }
}

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

  processUpdates();
  
  for(const lead of leadData) {
    const data = fetchLeadData(lead.leadgenId, pageAccessToken);
    console.log(data);
  }
});



app.listen();