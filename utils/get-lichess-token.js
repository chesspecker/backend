/* eslint-disable camelcase */
import fetch from 'node-fetch';
import {auth, siteUrl} from '../config/config.js';

const clientId = auth.LICHESS_CLIENT_ID;

const getLichessToken = async (authCode, verifier) =>
	fetch('https://lichess.org/api/token', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			grant_type: 'authorization_code',
			redirect_uri: `${siteUrl}/auth/callback`,
			client_id: clientId,
			code: authCode,
			code_verifier: verifier,
		}),
	})
		.then(response => response.json())
		.catch(error => {
			throw error;
		});

export default getLichessToken;
