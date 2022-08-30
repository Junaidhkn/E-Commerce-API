const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userRoute = require('./Routes/user');
const authRoute = require('./Routes/auth');
const productRoute = require('./Routes/product');

const app = express();
dotenv.config();

mongoose
	.connect(process.env.MONGO_URL)
	.then(() => {
		console.log('Connection established Successfully!');
	})
	.catch((err) => {
		console.log(err);
	});

app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);


app.listen('3000');
