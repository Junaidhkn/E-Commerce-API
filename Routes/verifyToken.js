const JWT = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
	const authHeader = req.headers.token;
	if (authHeader) {
		const token = authHeader.split(' ')[1];
		JWT.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
			if (err) {
				res.status(403).json('Token Not Valid!!!');
			} else {
				req.user = user;
				next();
			}
		});
	} else {
		return res.status(401).json('You are not authenticated!');
	}
};

const verifyTokenAuthorization = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.id === req.params.id || req.user.isAdmin) {
			next();
		} else {
			res.status(403).json('You are not allowed!!');
		}
	});
};

const verifyTokenAdmin = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.isAdmin) {
			next();
		} else {
			res.status(403).json('You are not admin!!');
		}
	});
};

module.exports = { verifyToken, verifyTokenAuthorization, verifyTokenAdmin };
