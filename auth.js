
// Import required modules
const mysql = require ("mysql"); //import Database Connection
 const bcrypt = require ('bcryptjs');

//  Import and configure MySQL database connection in this page
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs-login'
  });

// Establishes connection with the database
  db.connect((error) => {
    if (error) {
      console.error('Error connecting to database: ', error);
    } else {
      console.log('Connected to MYSQL database!');
    }
  });
    
    // This was sourced from Telmo Sampaio's Udemy course and also used the lecture videos
    // Function that handles the login and requests the name and password
    const handleLogin = async (req, res) => {
        try {
            //retrieves the username and password that the user has entered in the data
            const { name, password } = req.body;
        
            // Checks if name or password is missing
            if (!name || !password) {
               // Render a failed login page with a message if either name or password is missing
              return res.status(400).render('failedpages/failedLoginNoReg', {
                message: 'Please provide an Username and password',
              });
            }
        
            // Querys the database to get user data by name
            db.query('SELECT * FROM users WHERE name = ?', [name], async (error, results) => {
              console.log(results);
              // Handles query errors
              if (error) {
                console.error(error);
                return res.status(500).render('failedpages/failedLogin', {
                  message: 'An error occurred. Please try again later.',
                });
              }
              // Check if user exists and password matches
              if (!results || !(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).render('failedpages/failedLogin', {
                  message: 'Userame or Password is incorrect',
                });
              } else {
                const id = results[0].id;
                // If login is successful, redirect to home page
                // console.log(results);
                return res.redirect('/');
              }
            });
          } catch (error) {
            // Catch any missed or unexpected errors
            console.error(error);
            // Render a generic error page with a message
            res.status(500).render('login', {
              message: 'An error occurred. Please try again later.',
            });
          }
        }

    module.exports = {handleLogin};