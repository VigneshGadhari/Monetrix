const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const readline = require('readline');

// Create a MySQL database connection
const dbConnection = mysql.createConnection({
    host: 'moneytransferdb.ctrvodsbpmxi.ap-south-1.rds.amazonaws.com',
    port: "3306",
    user: 'admin',
    password: 'mysqlpasswordforysvs',
    database: 'monetrix',
});

// Connect to the MySQL database
dbConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter your plain password: ', async (plainPassword) => {
  try {
    const saltRounds = 10; // Number of rounds (adjust as needed)
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Replace 'stored_hashed_password' with the actual hashed password retrieved from the database
    const storedHashedPassword = '$2b$10$DLf6u28IiwIMRnk7D1TceOwvJGRZkmFruP6wVmpqDf5lyoiFlx3TS';

    // Verify the user-entered plain password with the stored hashed password
    const passwordMatch = await bcrypt.compare(plainPassword, storedHashedPassword);

    if (passwordMatch) {
      console.log('Password verification successful.');
    } else {
      console.log('Password verification failed.');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  rl.close();
});
