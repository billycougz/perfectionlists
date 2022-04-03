/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["CLIENT_ID","CLIENT_SECRET"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const aws = require('aws-sdk');
const querystring = require('querystring');
const randomstring = require('randomstring');

// Setup express
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});
app.listen(3000, function () {
  console.log('App started');
});

// Get secrets from AWS SSM and return in the form { Name: 'secretName', Value: 'secretValue', ... }[]
const getSecrets = async () => {
  const Names = ['CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI', 'FRONTEND_URI'].map(
    (secretName) => process.env[secretName]
  );
  const { Parameters } = await new aws.SSM().getParameters({ Names, WithDecryption: true }).promise();
  return Parameters;
};

// Cookie provides protection against CSRF attacks
const AUTH_COOKIE_NAME = 'spotify-toolbox-auth';

// Spotify Login - Request User Authorization
app.get('/authorize/login', async (req, res) => {
  console.log('/login');
  const { CLIENT_ID, REDIRECT_URI } = await getSecrets();
  const state = randomstring.generate(16);
  const scope =
    'user-read-private user-read-email user-read-recently-played user-top-read user-follow-read user-follow-modify playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private';
  res.cookie(AUTH_COOKIE_NAME, state);
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
        state: state,
      })
  );
});

// Spotify Login Callback - Request Access Token
app.get('/authorize/callback', async (req, res) => {
  console.log('/callback');
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, FRONTEND_URI } = await getSecrets();
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[AUTH_COOKIE_NAME] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
  } else {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization: 'Basic ' + new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      },
      json: true,
    };
    res.clearCookie(AUTH_COOKIE_NAME);
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token;
        const refresh_token = body.refresh_token;
        res.redirect(
          `${FRONTEND_URI}/#${querystring.stringify({
            access_token,
            refresh_token,
          })}`
        );
      } else {
        res.redirect(`/#${querystring.stringify({ error: 'invalid_token' })}`);
      }
    });
  }
});

// Spotify Refresh Token - Request a refreshed Access Token
app.get('/authorize/refresh_token', async (req, res) => {
  console.log('/refresh_token');
  const { CLIENT_ID, CLIENT_SECRET } = await getSecrets();
  const refresh_token = req.query.refresh_token;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: 'Basic ' + new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64') },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    json: true,
  };
  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
