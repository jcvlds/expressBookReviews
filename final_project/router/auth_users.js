const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

// This array will store user objects of the form {username: "...", password: "..."}
let users = [];

/**
 * Checks if the given username is valid for registration.
 * For example, we can define "valid" to mean "not already taken."
 * Returns true if username is NOT already in 'users'; false otherwise.
 */
const isValid = (username) => {
  // Check if this username already exists in 'users' array
  let userMatches = users.filter((user) => {
    return user.username === username;
  });
  return (userMatches.length === 0);
}

/**
 * Checks if username and password match an existing user's credentials.
 * Returns true if there's a match; false otherwise.
 */
const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return (validUsers.length > 0);
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({message: "Error logging in. Username and password are required."});
  }

  // Check if user is valid
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password
      }, 
      'fingerprint_customer', 
      { expiresIn: 60 * 60 } // expires in 1 hour
    );

    // Save the token and username in the session
    req.session.authorization = {
      accessToken, 
      username
    }
    return res.status(200).json({message: "User successfully logged in"});
  } else {
    return res.status(401).json({message: "Invalid Login. Check username and password."});
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  // The new review text can come from the body (req.body.review), or query. 
  // The instructions suggest using a query or the body, but let's use body here:
  let review = req.body.review;

  // Retrieve the username from the session
  let username = req.session.authorization.username;

  // If the book exists, post/update the review:
  if (books[isbn]) {
    let book = books[isbn];
    // Each user’s review is keyed by their username
    book.reviews[username] = review;
    return res.status(200).json({
      message: "Review successfully posted/updated",
      reviews: book.reviews
    });
  } else {
    return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let username = req.session.authorization.username;

  if (books[isbn]) {
    let book = books[isbn];
    if (book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({
        message: "Review successfully deleted",
        reviews: book.reviews
      });
    } else {
      return res.status(400).json({message: "No review found for this user to delete."});
    }
  } else {
    return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
