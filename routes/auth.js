/* eslint-disable camelcase */
import {createHash, randomBytes} from 'node:crypto';
import {Router} from 'express';
import {auth, config} from '../config/config.js';
import {User} from '../models/user-model.js';
import {
	getLichessUser,
	getLichessUserEmail,
} from '../utils/get-lichess-user.js';
import getLichessToken from '../utils/get-lichess-token.js';

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
	response.redirect(
		'https://lichess.org/oauth?' +
			new URLSearchParams({
				response_type: 'code',
				client_id: clientId,
				redirect_uri: `${url}/auth/callback`,
				scope: 'preference:read email:read',
				code_challenge_method: 'S256',
				code_challenge: challenge,
			}),
	);
});

router.get('/callback', async (request, response) => {
	const url =
		config.status === 'prod'
			? `https://api.chesspecker.com`
			: `http://localhost:${config.port}`;
	const verifier = request.session.codeVerifier;
	const lichessToken = await getLichessToken(request.query.code, verifier, url);

	if (!lichessToken.access_token) {
		response.send('Failed getting token');
		return;
	}

	const redirectUrl =
		config.status === 'prod'
			? 'https://www.chesspecker.com'
			: `http://localhost:${config.frontPort}`;

	const oauthToken = lichessToken.access_token;
	request.session.token = oauthToken;
	const lichessUser = await getLichessUser(oauthToken);
	const data = await getLichessUserEmail(oauthToken);
	const userMail = data.email;

	const [isAlreadyUsedId, isAlreadyUsedEmail] = await Promise.all([
		User.exists({id: lichessUser.id}),
		User.exists({email: userMail}),
	]);
	const userExists = isAlreadyUsedId || isAlreadyUsedEmail;
	if (userExists) {
		console.log('User already in db');
		response.redirect(302, `${redirectUrl}/success-login`);
	} else {
		const user = new User();
		user.id = lichessUser.id;
		user.username = lichessUser.username;
		user.url = lichessUser.url;
		user.email = userMail;
		user.permissionLevel = 1;
		user.createdAt = lichessUser.createdAt;
		user.playTime = lichessUser.playTime.total;
		user.count = {
			all: lichessUser.count.all,
			rated: lichessUser.count.rated,
		};
		user.perfs = {
			ultraBullet: {
				games: lichessUser.perfs.ultraBullet.games,
				rating: lichessUser.perfs.ultraBullet.rating,
			},
			bullet: {
				games: lichessUser.perfs.bullet.games,
				rating: lichessUser.perfs.bullet.rating,
			},
			blitz: {
				games: lichessUser.perfs.blitz.games,
				rating: lichessUser.perfs.blitz.rating,
			},
			rapid: {
				games: lichessUser.perfs.rapid.games,
				rating: lichessUser.perfs.rapid.rating,
			},
			classical: {
				games: lichessUser.perfs.classical.games,
				rating: lichessUser.perfs.classical.rating,
			},
			correspondence: {
				games: lichessUser.perfs.correspondence.games,
				rating: lichessUser.perfs.correspondence.rating,
			},
		};

		user.save(error => {
			if (error) throw new Error(error);
			console.log('saved !');
		});

		response.redirect(302, `${redirectUrl}/success-login`);
	}
});

export default router;
