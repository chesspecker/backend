import fetch from 'node-fetch';

export const getLichessUser = async accessToken =>
	fetch('https://lichess.org/api/account', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	}).then(response => response.json());

export const getLichessUserEmail = async accessToken =>
	fetch('https://lichess.org/api/account/email', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	}).then(response => response.json());
