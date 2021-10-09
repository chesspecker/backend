import fetch from 'node-fetch';

const getLichessData = async (accessToken, url) =>
	fetch(`https://lichess.org/api/account/${url}`, {
		headers: {Authorization: `Bearer ${accessToken}`},
	}).then(response => response.json());

export default getLichessData;
