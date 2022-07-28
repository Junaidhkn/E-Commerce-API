const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const JWT = require('jsonwebtoken');

const User = require('../Models/User');

// Register

router.post('/register', async (req, res) => {
	const newUser = new User({
		username: req.body.username,
		email: req.body.email,
		password: CryptoJS.AES.encrypt(
			req.body.password,
			process.env.SECRET_KEY_PASSWORD,
		).toString(),
	});
	try {
		const savedUser = await newUser.save();
		res.json(savedUser);
	} catch (err) {
		res.status(500).json(err);
	}
});

// Login

router.post('/login', async (req, res) => {
	try {
		const user = await User.findOne({ username: req.body.username });
		!user && res.status(401).json('Wrong Credentials!!!');
		const hashedPassword = CryptoJS.AES.decrypt(
			user.password,
			process.env.SECRET_KEY_PASSWORD,
		);
		const passwordString = hashedPassword.toString(CryptoJS.enc.Utf8);
		passwordString !== req.body.password &&
			res.status(401).json('Wrong Credentials!!!');

		const accessToken = JWT.sign(
			{
				id: user._id,
				isAdmin: user.isAdmin,
			},
			process.env.JWT_SECRET_KEY,
			{ expiresIn: '2d' },
		);

		const { password, ...otherData } = user._doc;
		res.status(200).json({ ...otherData, accessToken });
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
