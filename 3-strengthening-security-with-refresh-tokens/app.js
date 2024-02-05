// app.js

const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const users = [
    { id: 1, username: 'user1', email: 'user1@example.com', password: 'password1' },
    { id: 2, username: 'user2', email: 'user2@example.com', password: 'password2' },
    { id: 3, username: 'user3', email: 'user3@example.com', password: 'password3' }
];

const posts = [
    { id: 1, title: 'Post 1', content: 'Content of Post 1', username: 'user1' },
    { id: 2, title: 'Post 2', content: 'Content of Post 2', username: 'user2' },
    { id: 3, title: 'Post 3', content: 'Content of Post 3', username: 'user1' },
    { id: 4, title: 'Post 4', content: 'Content of Post 4', username: 'user3' },
    { id: 5, title: 'Post 5', content: 'Content of Post 5', username: 'user2' }
];

// Array to store active refresh tokens
const activeRefreshTokens = [];

// Middleware to check if a valid token is provided
const verifyAcessToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401).json({message: "no token was provided"});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
        return res.sendStatus(403).json({message: err.message});
        }
        req.username = username;
        next();
    });
};

// Middleware to verify refresh token
const verifyRefreshToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    if (!activeTokens.some(e => e.token === token)) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: err.message });
        }
        req.user = user;
        next();
    });
};

// Route for posts (protected)
app.get('/posts', verifyAcessToken, (req, res) => {
    const userPosts = posts.filter(post => post.username === req.username);
    return res.json(userPosts);
});

// Route for login (generate token and refresh token)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // ... authentication logic ...

    const accessToken = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ username }, process.env.REFRESH_SECRET, { expiresIn: '1d' });

    activeRefreshTokens.push({username, token: refreshToken});

    res.json({ accessToken, refreshToken });
});

// Route to obtain a new access token using refresh token
app.post('/refresh', verifyRefreshToken, (req, res) => {
    const newAccessToken = jwt.sign({ username: req.user.username }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
