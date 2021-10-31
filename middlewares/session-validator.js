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
