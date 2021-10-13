import {createHash, randomBytes} from 'node:crypto';
import {Router} from 'express';
import {auth, siteUrl, siteRedirectUrl} from '../config/config.js';
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
	if (request.session.token) {
		response.redirect(302, `${siteRedirectUrl}/success-login`);
	} else {
		const verifier = createVerifier();
		const challenge = createChallenge(verifier);
		request.session.codeVerifier = verifier;
		const linkParameters = new URLSearchParams({
			response_type: 'code',
			client_id: clientId,
			redirect_uri: `${siteUrl}/auth/callback`,
			scope: 'preference:read email:read',
			code_challenge_method: 'S256',
			code_challenge: challenge,
		});
		response.redirect(302, `https://lichess.org/oauth?${linkParameters}`);
	}
});

router.get('/callback', async (request, response, next) => {
	const verifier = request.session.codeVerifier;
	const lichessToken = await getLichessToken(request.query.code, verifier);

	if (!lichessToken.access_token) {
		return next(new Error('Failed getting token'));
	}

	const oauthToken = lichessToken.access_token;
	const lichessUser = await getLichessData(oauthToken);
	request.session.token = oauthToken;
	request.session.userID = lichessUser.id;
	request.session.username = lichessUser.username;
	const {email: userMail} = await getLichessData(oauthToken, '/email');
	const [isAlreadyUsedId, isAlreadyUsedEmail] = await Promise.all([
		User.exists({id: lichessUser.id}),
		User.exists({email: userMail}),
	]);
	const userExists = isAlreadyUsedId || isAlreadyUsedEmail;
	if (!userExists) {
		const user = generateUser(lichessUser, userMail);
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
