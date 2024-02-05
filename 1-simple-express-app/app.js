// app.js

const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const users = [
    { id: 1, username: 'user1', email: 'user1@example.com' },
    { id: 2, username: 'user2', email: 'user2@example.com' },
    { id: 3, username: 'user3', email: 'user3@example.com' }
  ];
  
  // Array of posts
  const posts = [
    { id: 1, title: 'Post 1', content: 'Content of Post 1', username: 'user1' },
    { id: 2, title: 'Post 2', content: 'Content of Post 2', username: 'user2' },
    { id: 3, title: 'Post 3', content: 'Content of Post 3', username: 'user1' },
    { id: 4, title: 'Post 4', content: 'Content of Post 4', username: 'user3' },
    { id: 5, title: 'Post 5', content: 'Content of Post 5', username: 'user2' }
  ];

// Route for posts (protected)
app.get('/posts', (req, res) => {
  res.json(posts);
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


