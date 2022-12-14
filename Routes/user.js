const express = require('express');

const User = require('./Models/User');
const { verifyTokenAuthorization, verifyTokenAdmin } = require('./verifyToken');

const router = express.Router();

// Update User
router.put('/:id', verifyTokenAuthorization, async (req, res) => {
	if (req.body.password) {
		req.body.password = CryptoJS.AES.encrypt(
			req.body.password,
			process.env.SECRET_KEY_PASSWORD,
		).toString();
	}

	try {
		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{
				$set: req.body,
			},
			{ new: true },
		);
		res.status(200).json(updatedUser);
	} catch (err) {
		res.status(500).json(err);
	}
});

// Delete User

router.delete('/:id', verifyTokenAuthorization, async (req, res) => {
	try {
		await User.findByIdAndDelete(req.params.id);
		res.status(200).json('User has been deleted !');
	} catch (err) {
		res.status(500).json(err);
	}
});

// Get User

router.get('/find/:id', verifyTokenAdmin, async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		const { password, ...others } = user._doc;
		res.status(200).json(others);
	} catch (err) {
		res.status(500).json(err);
	}
});

// Get All Users

router.get('/', verifyTokenAdmin, async (req, res) => {
	const query = req.query.new;
	try {
		const users = query
			? await User.find().sort({ _id: -1 }).limit(5)
			: await User.find();
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json(err);
	}
});

// Get User Stats

router.get('/stats', verifyTokenAdmin, async (req, res) => {
	const date = new Date();
	const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

	try {
		const stats = await User.aggregate([
			{
				$match: {
					createdAt: {
						$gte: lastYear,
					},
				},
			},
			{
				$project: {
					$month: '$createdAt',
				},
			},
			{
				$group: {
					_id: '$month',
					total: { $sum: 1 },
				},
			},
		]);
		res.status(200).json(stats);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
