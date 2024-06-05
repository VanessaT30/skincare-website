const path = require('path'); //also new course
const express = require('express');  //1st
const mysql = require ("mysql"); //Database Connection
const bcrypt = require('bcryptjs'); // to encrypt the password
const ejs = require('ejs');
const { handleLogin } = require('./auth'); // path for custom module
// const bodyParser = require("body-parser");



const app = express(); //2nd
// app.use(bodyParser.urlencoded({extended: true}));
// Import and configure MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs-login'
});

const shopDB = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'G00425751'
});

//Serving static files, 
//code block from: Telmo Sampaio's Udemy course
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory))
app.use(express.static('public'))

//Parsing URL encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
app.use (express.json());

//Setting the view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Establish connection with the shop database
// Code Block from lecture videos
shopDB.connect((error) => {
  if (error) {
    console.error('Error connecting to database: ', error);
  } else {
    console.log('Connected to MYSQL shop database!');
  }
});

// Establish connection with the database
db.connect((error) => {
  if (error) {
    console.error('Error connecting to database: ', error);
  } else {
    console.log('Connected to MYSQL database!');
  }
});





//Defining get and post methods
// Render the home page page
app.get("/", (req, res) => {
  res.render("index");
});
// Render the login page page
// Login and register code block from: Telmo Sampaio's Udemy course: The Complete Nodejs MySQL Login System
// Modified and kept the register code on the same page instead of adding routes to other files 
// and also left cookies out
app.get("/login", (req, res) => {
  res.render("login");
});

// uses the imported login handler method
app.post("/login", handleLogin);

//Code from Telmo Sampaio's course
// Render the register page
app.get("/register", (req, res) => {
  res.render("register");
});

// Handle registration form submission
app.post("/register", async (req, res) => {
  // requests the name, email, password, passwordConfirm data from the database
  const { name, email, password, passwordConfirm } = req.body;

  try {
    // Routes to failed pages id an error has occurred during registration
    // loops over the username array to check if it is already taken
    db.query('SELECT name FROM users WHERE name = ?', [name], async (error, results) => {
      if (error) {
        console.error("Error retrieving data from database:", error);
        return res.status(500).render('failedpages/failedNameReg', {
          message: 'Error retrieving data from database'
        });
      }

  // Check if the username is already in use
      if (results.length > 0) {
        return res.render('failedpages/failedNameReg', {
          message: 'Username is already in use'
        });
        // Check if password and confirmed password are the same
        // if not routed to failed pages
      } else if (password !== passwordConfirm) {
    return res.status(400).render('failedpages/passwordsDontMatch', {
      message: 'Passwords do not match'
    });
  }

      // Encrypt the password using bcrypt
      let hashedPassword = await bcrypt.hash(password, 8);
      console.log(hashedPassword); // Using this password (for debugging)

      // Insert the new user into the database and logs the result to console
      db.query('INSERT INTO users SET ?', { name, email, password: hashedPassword }, (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).render('failedpages/failedEmailReg', {
            message: 'Error inserting data into database'
          });
        } else {
          console.log(results);
          return res.render ('login',
              {message: 'user registered successfully'
        });
      }});
    });
  // If other errors were missed, redirected to failed pages
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).render('failedpages/failedEmailReg', {
      message: 'An error occurred during registration'
    });
  }
});


// Renders the single product pages
// Code block sourced from the lecture videos Week 11
// Get method used to retrieve product data
app.get("/products1", function(req, res){
//retrieves the id no. from the database
  const ID = req.query.rec;
  // Query the database to retrieve the product data by id
  shopDB.query("SELECT * FROM proddata WHERE id = ?", [ID], function(err, rows, fields) {
    // Error handling
    if(err) 
    {
      console.error("Error retrieving data from database:", err);
      res.status(500).send("Error retreiving data from database");
    } 
    else if(rows.length === 0) 
    {
      console.error("No rows found for ID $[ID]");
      res.status(404).send("No product found for ID $[ID]");
    } 
    else 
    {
      // Logs to console the retrieved data and render the product page with it
      console.log("Data retrieved from the Database!");

      // retrieves product data from the row found
      const prodName = rows[0].name;
      const prodPrice = rows[0].price;
      const pic = rows[0].image;
      // Render the single products page template with the product data found
      res.render("products1.ejs", {myMessage: prodName, price: prodPrice, myImage: pic});
    }
  })
});

// Unsure why I need this code block, but the server breaks when it is taken away.
// Route for posting product data to the server
app.post("/products1", (req, res) => {
  //  // requests the id, name, price, image data from the database
  // const { id, name, price, image } = req.body;

  // // Checks if any fields are empty
  // if (!id || !name || !price || !image) {
  //   return res.status(400).send("All fields are required");
  // }
  // // Insert the product data into the database
  // shopDB.query("INSERT INTO proddata SET ?", { id, name, price, image }, (err, result) => {
  //   // Handles any errors during the query
  //   if (err) {
  //     console.error("Error inserting data into database:", err);
  //     // Sends a 500 status code if there's an error
  //     return res.status(500).send("Error inserting data into database");
  //   }
  //   // Log success message to the console
  //   console.log("Product added successfully!", result);
  //   // Sends 201 for successful query
  //   res.status(201).send("Product added successfully");
  // });
});


// Renders the cart page
app.get("/cart", (req, res) => {
  res.render("cart");
});

// listen for incoming requests on port 3000 and logs successful message to the console
app.listen(3000, () => {
  console.log ("Server Started on port 3000")
});
