const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// TASK 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check for missing fields
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }

  // Check if username already exists
  if (!isValid(username)) {
    return res.status(400).json({message: "User already exists!"});
  }

  // Register new user
  users.push({ 
    username: username,
    password: password
  });
  return res.status(200).json({message: "User successfully registered."});
});

// TASK 1 + TASK 10: Get the book list
// We also demonstrate a Promise-based approach (Tasks 10-13).
public_users.get('/', function (req, res) {
  // Using a Promise to mimic async behavior
  let getBooks = new Promise((resolve, reject) => {
    // In a real-world scenario, you might fetch from DB or an external API
    resolve(books);
  });

  getBooks.then((bookList) => {
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  }).catch((err) => {
    return res.status(500).json({message: "Unable to fetch books."});
  });
});

// TASK 2 + TASK 11: Get book details based on ISBN (Promise-based)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  let getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN.then((book) => {
    return res.status(200).json(book);
  }).catch((err) => {
    return res.status(404).json({message: err});
  });
});

// TASK 3 + TASK 12: Get book details based on author (Promise-based)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  let getBooksByAuthor = new Promise((resolve, reject) => {
    let filtered_books = {};
    Object.keys(books).forEach((key) => {
      if (books[key].author === author) {
        filtered_books[key] = books[key];
      }
    });
    if (Object.keys(filtered_books).length > 0) {
      resolve(filtered_books);
    } else {
      reject("Author not found");
    }
  });

  getBooksByAuthor.then((result) => {
    return res.status(200).json(result);
  }).catch((err) => {
    return res.status(404).json({message: err});
  });
});

// TASK 4 + TASK 13: Get all books based on title (Promise-based)
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  let getBooksByTitle = new Promise((resolve, reject) => {
    let filtered_books = {};
    Object.keys(books).forEach((key) => {
      if (books[key].title === title) {
        filtered_books[key] = books[key];
      }
    });
    if (Object.keys(filtered_books).length > 0) {
      resolve(filtered_books);
    } else {
      reject("Title not found");
    }
  });

  getBooksByTitle.then((result) => {
    return res.status(200).json(result);
  }).catch((err) => {
    return res.status(404).json({message: err});
  });
});

// TASK 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
