import {createHash, randomBytes} from 'node:crypto';
import {Router} from 'express';
import {auth, config} from '../config/config.js';
import {User} from '../models/user-model.js';
import getLichessData from '../utils/get-lichess-data.js';
import getLichessToken from '../utils/get-lichess-token.js';
import generateUser from '../controllers/user-generator.js';

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

router.get('/login', async (request, response) => {
	const url =
		config.status === 'prod'
			? `https://api.chesspecker.com`
			: `http://localhost:${config.port}`;
	const verifier = createVerifier();
	const challenge = createChallenge(verifier);
	request.session.codeVerifier = verifier;
	const linkParameters = new URLSearchParams({
		response_type: 'code',
		client_id: clientId,
		redirect_uri: `${url}/auth/callback`,
		scope: 'preference:read email:read',
		code_challenge_method: 'S256',
		code_challenge: challenge,
	});
	response.redirect(302, `https://lichess.org/oauth?${linkParameters}`);
});

router.get('/callback', async (request, response) => {
	const url =
		config.status === 'prod'
			? `https://api.chesspecker.com`
			: `http://localhost:${config.port}`;
	const redirectUrl =
		config.status === 'prod'
			? 'https://www.chesspecker.com'
			: `http://localhost:${config.frontPort}`;
	const verifier = request.session.codeVerifier;
	const lichessToken = await getLichessToken(request.query.code, verifier, url);

	if (!lichessToken.access_token) {
		response.send('Failed getting token');
		return;
	}

	const oauthToken = lichessToken.access_token;
	request.session.token = oauthToken;
	const lichessUser = await getLichessData(oauthToken);
	const {email: userMail} = await getLichessData(oauthToken, '/email');
	const [isAlreadyUsedId, isAlreadyUsedEmail] = await Promise.all([
		User.exists({id: lichessUser.id}),
		User.exists({email: userMail}),
	]);
	const userExists = isAlreadyUsedId || isAlreadyUsedEmail;
	if (userExists) {
		console.log('User already in db');
		response.redirect(302, `${redirectUrl}/success-login`);
	} else {
		const user = generateUser(lichessUser, userMail);
		user.save(error => {
			if (error) throw new Error(error);
			console.log('saved !');
		});

		response.redirect(302, `${url}/success-login`);
	}
});

router.get('/logout', (request, response) => {
	const redirectUrl =
		config.status === 'prod'
			? 'https://www.chesspecker.com'
			: `http://localhost:${config.frontPort}`;
	request.session.destroy(error => {
		if (error) {
			return console.log(error);
		}

		response.redirect(302, redirectUrl);
	});
});

export default router;
