const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// This sets up the session on the "/customer" path
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Authentication middleware for any route matching "/customer/auth/*"
app.use("/customer/auth/*", function auth(req, res, next){
  if (req.session.authorization) {
    let token = req.session.authorization['accessToken'];
    jwt.verify(token, "fingerprint_customer", (err, user) => {
      if (!err) {
        // user is successfully authenticated
        req.user = user;
        return next();
      } else {
        return res.status(403).json({message: "User not authenticated"});
      }
    });
  } else {
    return res.status(403).json({message: "User not logged in"});
  }
});

const PORT = 5000;

// Routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => console.log("Server is running"));
