import httpStatus from 'http-status';
import {config} from '../config/config.js';

/**
 * Extract an error stack or error message from an Error object.
 */
function getErrorMessage(error) {
	if (error.stack) {
		return error.stack;
	}

	if (typeof error.toString === 'function') {
		return error.toString();
	}

	return '';
}

/**
 * Log an error message to stderr.
 */
function logErrorMessage(error) {
	console.error(error);
}

/**
 * Determines if an HTTP status code falls in the 4xx or 5xx error ranges.
 */
const isErrorStatusCode = statusCode => statusCode >= 400 && statusCode < 600;

/**
 * Look for an error HTTP status code (in order of preference):
 *
 * - Error object (`status` or `statusCode`)
 * - Express response object (`statusCode`)
 *
 * Falls back to a 500 (Internal Server Error) HTTP status code.
 */
function getHttpStatusCode({error, response}) {
	const statusCodeFromError = error.status || error.statusCode;
	if (isErrorStatusCode(statusCodeFromError)) {
		return statusCodeFromError;
	}

	const statusCodeFromResponse = response.statusCode;
	if (isErrorStatusCode(statusCodeFromResponse)) {
		return statusCodeFromResponse;
	}

	return httpStatus.INTERNAL_SERVER_ERROR;
}

const NODE_ENVIRONMENT = config.status || 'dev';

/**
 * Generic Express error handler middleware.
 */
function errorHandlerMiddleware(error, request, response, next) {
	const errorMessage = getErrorMessage(error);
	logErrorMessage(errorMessage);

	if (response.headersSent) {
		return next(error);
	}

	const errorResponse = {
		statusCode: getHttpStatusCode({error, response}),
		body: undefined,
	};

	if (NODE_ENVIRONMENT !== 'prod') {
		errorResponse.body = errorMessage;
	}

	response.status(errorResponse.statusCode);
	response.format({
		'application/json': () => response.json({message: errorResponse.body}),
		default: () => response.type('text/plain').send(errorResponse.body),
	});
}

export default errorHandlerMiddleware;
