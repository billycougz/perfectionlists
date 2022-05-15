/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["CLIENT_ID","CLIENT_SECRET","REDIRECT_URI","FRONTEND_URI"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const request = require('request');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const aws = require('aws-sdk');
const querystring = require('querystring');
const randomstring = require('randomstring');

// Setup express
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(awsServerlessExpressMiddleware.eventContext());
app.use(cors());
app.listen(3000, function () {
	console.log('App started');
});

// Returns a string array of secret values
const getSecretValues = async (secretNames) => {
	// Retrieving parameters one by one to ensure order is maintained
	const parameterPromises = secretNames.map((secretName) => {
		// An environment specific prefix is applied to the base secret name and stored as an env variable
		const Name = process.env[secretName];
		return new aws.SSM().getParameter({ Name, WithDecryption: true }).promise();
	});
	const parameterResponses = await Promise.all(parameterPromises);
	// Each response contains a Parameter object in the form of { Name: 'secretName', Value: 'secretValue', ... }
	return parameterResponses.map((response) => response.Parameter.Value);
};

// Cookie provides protection against CSRF attacks
const AUTH_COOKIE_NAME = 'spotify-toolbox-auth';

// Spotify Login - Request User Authorization
app.get('/authorize/login', async (req, res) => {
	console.log('/login');
	const [client_id, redirect_uri] = await getSecretValues(['CLIENT_ID', 'REDIRECT_URI']);
	console.log(client_id, redirect_uri);
	const state = randomstring.generate(16);
	const scope =
		'user-read-private user-read-email user-read-recently-played user-top-read user-follow-read user-follow-modify playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private';
	res.cookie(AUTH_COOKIE_NAME, state);
	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id,
				scope,
				redirect_uri,
				state,
			})
	);
});

// Spotify Login Callback - Request Access Token
app.get('/authorize/callback', async (req, res) => {
	console.log('/callback');
	const [client_id, client_secret, redirect_uri, frontend_uri] = await getSecretValues([
		'CLIENT_ID',
		'CLIENT_SECRET',
		'REDIRECT_URI',
		'FRONTEND_URI',
	]);
	const code = req.query.code || null;
	const state = req.query.state || null;
	console.log('state', state);
	const storedState = req.cookies ? req.cookies[AUTH_COOKIE_NAME] : null;
	console.log('storedState', storedState);
	if (state === null || state !== storedState) {
		res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
	} else {
		const authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri,
				grant_type: 'authorization_code',
			},
			headers: {
				Authorization: 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64'),
			},
			json: true,
		};
		res.clearCookie(AUTH_COOKIE_NAME);
		request.post(authOptions, function (error, response, body) {
			console.log('response', response);
			if (!error && response.statusCode === 200) {
				const access_token = body.access_token;
				const refresh_token = body.refresh_token;
				console.log(
					`${frontend_uri}/#${querystring.stringify({
						access_token,
						refresh_token,
					})}`
				);
				res.redirect(
					`${frontend_uri}/#${querystring.stringify({
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
	const [client_id, client_secret] = await getSecretValues(['CLIENT_ID', 'CLIENT_SECRET']);
	const refresh_token = req.query.refresh_token;
	const authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: { Authorization: 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64') },
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
