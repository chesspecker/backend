import mongoose from 'mongoose';

const {Schema} = mongoose;

export const userDefinition = new Schema({
	id: String,
	username: String,
	url: String,
	email: String,
	permissionLevel: Number,
	lastUpdatedAt: Date,
	perfs: {
		ultraBullet: {games: Number, rating: Number},
		bullet: {games: Number, rating: Number},
		blitz: {games: Number, rating: Number},
		rapid: {games: Number, rating: Number},
		classical: {games: Number, rating: Number},
		correspondence: {games: Number, rating: Number},
		puzzle: {games: Number, rating: Number},
	},
	puzzleSet: [{type: Schema.Types.ObjectId, ref: 'PuzzleSet'}],
});

const userSchema = new mongoose.Schema(userDefinition);
const User = mongoose.model('User', userSchema);

export {User};
