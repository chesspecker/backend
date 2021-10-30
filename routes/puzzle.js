import {Router} from 'express';
import {Puzzle} from '../models/puzzle-model.js';
import sessionValidator from '../middlewares/session-validator.js';
import puzzleUpdater from '../middlewares/puzzle-updater.js';

const router = new Router();

/**
 * @openapi
 * components:
 *	schemas:
 *		Puzzle:
 *			type: object
 *			properties:
 *				PuzzleId:
 *					type: string
 *					description: The number of seconds the backend has been online.
 *					example: 003YT
 *				FEN:
 *					type: string
 *					description: FEN is the position before the opponent makes their move. The position to present to the player is after applying the first move to that FEN. The second move is the beginning of the solution.
 *					example: 'r1bqk1nr/1pp2ppp/p1pb4/4p3/3PP3/5N2/PPP2PPP/RNBQ1RK1 b kq - 0 6'
 *				Moves:
 *					type: string
 *					description: The list of moves in UCI format, space separated.
 *					example: 'd8f6 d4e5 d6e5 c1g5 f6d6 f3e5 d6d1 f1d1'
 *				Rating:
 *					type: number
 *					description: The number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
 *					example: '1387'
 *				RatingDeviation:
 *					type: number
 *					description: The number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
 *					example: '500'
 *				Popularity:
 *					type: number
 *					description: Popularity is a number between 100 (best) and -100 (worst).
 *					example: '-5'
 *				NbPlays:
 *					type: number
 *					description: The number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
 *					example: '0'
 *				Themes:
 *					type: array
 *					description: The number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
 *					items:
 *						Theme:
 *							type: string
 *							description: string
 *						GameUrl:
 *							type: string
 *							description: The number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
 *							example: '1635426778044'
 */

/**
 * @openapi
 * /puzzle/{id}:
 *	get:
 *		summary: Retrieve a single puzzle.
 *		description: Retrieve a single puzzle.
 *		parameters:
 *			- in: path
 *				name: id
 *				required: true
 *				description: MongoDB Id of the puzzle to retrieve.
 *				schema:
 *					type: string
 *		reponses:
 *			200:
 *				description:
 *				content:
 *					application/json:
 *						$ref: '#/components/schemas/Puzzle'
 */

router.get('/:id', sessionValidator, async (request, response, next) => {
	const puzzleId = request.params.id;
	Puzzle.findById(puzzleId, (error, result) => {
		if (error) return next(error);
		return response.send(result);
	});
});

/**
 * @openapi
 * /puzzle/{id}:
 *	put:
 *		summary: Update a single puzzle.
 *		description: Update a single puzzle.
 *		parameters:
 *			- in: path
 *				name: id
 *				required: true
 *				description: MongoDB Id of the puzzle to update.
 *				schema:
 *					type: string
 *		reponses:
 *			200:
 *				description:
 *				content:
 *					application/json:
 *						success
 */
router.put('/:id', sessionValidator, puzzleUpdater);

export default router;
