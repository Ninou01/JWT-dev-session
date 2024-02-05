// app.js

const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    credentials: true,
}));
app.use(
express.urlencoded({
    extended: true,
})
);
app.use(express.json());
app.use(cookieParser());

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

const blackList = []

// Middleware to check if a valid token is provided
const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No token was provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: err.message });
        }
        if (blackList.includes(token)) {
            return res.status(403).json({ message: 'your token isnt valide anymore' });
        }
        req.username = user.username;
        next();
    });
};


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./index.html"));
  });

// Route for posts (protected)
app.get('/posts', verifyAccessToken, (req, res) => {
    const userPosts = posts.filter(post => post.username === req.username);
    return res.json(userPosts);
});

// Route for login (generate token and refresh token)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // ... authentication logic ...

    const accessToken = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ username }, process.env.REFRESH_SECRET, { expiresIn: '1d' });

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.json({ accessToken });
});

// Route to obtain a new access token using refresh token
app.post('/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: err.message });
        }

        const newAccessToken = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken: newAccessToken });
    });
});

app.post('/logout', verifyAccessToken, (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    res.clearCookie('refreshToken');
    blackList.push(token)
    return res.status(200).json({message: "user was signed out"})
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});