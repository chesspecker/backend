import mongoose from 'mongoose';

const {Schema} = mongoose;

const puzzleDefinition = new Schema({
	PuzzleId: {type: String},
	FEN: {type: String},
	Moves: {type: String},
	Rating: {type: String},
	RatingDeviation: {type: String},
	Popularity: {type: String},
	NbPlays: {type: String},
	Themes: [{type: String}],
	GameUrl: {type: String},
});

const PuzzleSchema = new mongoose.Schema(puzzleDefinition);
const Puzzle = mongoose.model('Puzzle', PuzzleSchema);

export {Puzzle};
