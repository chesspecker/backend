/* eslint-disable camelcase */
import {createHash, randomBytes} from 'node:crypto';
import {Router} from 'express';
import {auth, siteUrl, siteRedirectUrl} from '../config/config.js';
import {User} from '../models/user-model.js';
import getLichessData from '../utils/get-lichess-data.js';
import getLichessToken from '../utils/get-lichess-token.js';
import userGenerator from '../controllers/user-generator.js';
import userUpdater from '../middlewares/user-updater.js';
import {dbValidator} from '../middlewares/session-validator.js';

const router = new Router();
const clientId = auth.LICHESS_CLIENT_ID;

const base64URLEncode = string_ =>
	string_
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');

const sha256 = buffer => createHash('sha256').update(buffer).digest();
const createVerifier = () => base64URLEncode(randomBytes(32));
const createChallenge = verifier => base64URLEncode(sha256(verifier));

router.get('/login', dbValidator, userUpdater, async (request, response) => {
	const verifier = createVerifier();
	const challenge = createChallenge(verifier);
	request.session.codeVerifier = verifier;
	const linkParameters = new URLSearchParams({
		response_type: 'code',
		client_id: clientId,
		redirect_uri: `${siteUrl}/auth/callback`,
		scope: 'preference:read',
		code_challenge_method: 'S256',
		code_challenge: challenge,
	});
	response.redirect(302, `https://lichess.org/oauth?${linkParameters}`);
});

router.get('/callback', async (request, response, next) => {
	const verifier = request.session.codeVerifier;

	let oauthToken;
	try {
		const lichessToken = await getLichessToken(request.query.code, verifier);
		oauthToken = lichessToken.access_token;
	} catch (error) {
		return next(new Error(`Failed getting token ${error}`));
	}

	let lichessUser;
	try {
		lichessUser = await getLichessData(oauthToken);
		if (!lichessUser) throw new Error('user login failed');
	} catch (error) {
		return next(error);
	}

	request.session.token = oauthToken;
	request.session.userID = lichessUser.id;
	request.session.username = lichessUser.username;

	let isAlreadyUsedId;
	try {
		isAlreadyUsedId = await User.exists({id: lichessUser.id});
	} catch (error) {
		return next(error);
	}

	if (!isAlreadyUsedId) {
		const user = userGenerator(lichessUser);
		user.save(error => {
			if (error) return next(error);
		});
	}

	response.redirect(302, `${siteRedirectUrl}/success-login`);
});

router.get('/logout', (request, response, next) => {
	request.session.destroy(error => {
		if (error) return next(error);
		response.redirect(302, siteRedirectUrl);
	});
});

export default router;
