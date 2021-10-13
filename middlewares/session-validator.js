const sessionValidator = async function (request, response, next) {
	if (request.session.token) {
		next();
	} else {
		response
			.status(403)
			.json({status: 'error', reason: 'No session cookie found'});
	}
};

export default sessionValidator;
