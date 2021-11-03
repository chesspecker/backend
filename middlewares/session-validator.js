import {siteRedirectUrl} from '../config/config.js';
import {User} from '../models/user-model.js';

const sessionValidator = async function (request, _response, next) {
	if (request.session.token) {
		next();
	} else {
		const error = new Error('no session cookie');
		error.statusCode = 403;
		next(error);
	}
};

export default sessionValidator;

export const dbValidator = async function (request, response, next) {
	if (request.session.token) {
		const {userID} = request.session;
		User.findOne({id: userID}, (error, result) => {
			if (error) return next(error);
			if (result === null) {
				request.session.destroy(error => {
					if (error) return next(error);
					return next();
				});
			}

			return response.redirect(302, `${siteRedirectUrl}/success-login`);
		});
	} else {
		next();
	}
};
