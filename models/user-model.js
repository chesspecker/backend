import mongoose from 'mongoose';

const {Schema} = mongoose;

export const userDefinition = new Schema({
	id: String,
	username: String,
	url: String,
	email: String,
	permissionLevel: Number,
	createdAt: Number,
	playTime: Number,
	count: {
		all: Number,
		rated: Number,
	},
	perfs: {
		ultraBullet: {games: Number, rating: Number},
		bullet: {games: Number, rating: Number},
		blitz: {games: Number, rating: Number},
		rapid: {games: Number, rating: Number},
		classical: {games: Number, rating: Number},
		correspondence: {games: Number, rating: Number},
	},
});

export const userSchema = new mongoose.Schema(userDefinition);
export const User = mongoose.model('User', userSchema);

const userModel = {
	definition: userDefinition,
	schema: userSchema,
	model: User,
};

export default userModel;
