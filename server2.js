const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path'); // Import the 'path' module
const app = express();
const bcrypt = require('bcrypt');
// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection configuration
const dbConfig = {
  host: 'moneytransferdb.ctrvodsbpmxi.ap-south-1.rds.amazonaws.com',
  port: "3306",
  user: 'admin',
  password: 'mysqlpasswordforysvs',
  database: 'monetrix',
};

const db = mysql.createConnection(dbConfig);

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to the database as ID ' + db.threadId);
});

app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});



// Handle login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("in login");

  try {
    // Perform SQL query to retrieve the stored hashed password for the provided username
    const getPasswordQuery = "SELECT Password FROM UserAccounts WHERE Username = ?";
    db.query(getPasswordQuery, [username], async (err, results) => {
      if (err) {
        console.error('SQL error: ' + err.message);
        return res.status(500).send('Internal server error');
      }

      if (results.length === 1) {
        const storedHashedPassword = results[0].Password;

        // Verify the user-entered plain password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

        if (passwordMatch) {
          // Password verification successful, you can proceed with the login logic
          res.redirect('/Transaction.html');
          console.log("Redirect to main page");
        } else {
          // Password verification failed, display an error message
          res.status(401).send('Login failed. Please check your username and password.');
        }
      } else {
        // Username not found, display an error message
        res.status(401).send('Login failed. User not found.');
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
});


async function hashAndStorePassword(username, password,phone,email) {
  try {
    // Generate a salt and hash the password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the user data into the MySQL database
    const query = 'INSERT INTO UserAccounts (Email, PhoneNumber, Username, Password) VALUES (?, ?, ?, ?)';
    const values = [email, phone, username, hashedPassword];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error storing user data:', err);
      } else {
        console.log('User registered successfully');
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
  }
}

  app.post('/signup', (req, res) => {
    const { username, phone, email, password } = req.body;
    // const pancardImage = req.file;
    hashAndStorePassword(username, password,phone,email);
  });


// ... (your existing code)
let reversed = true;
app.post('/transaction', (req, res) => {
  const { senderID, payeeID, amount, remarks } = req.body;
  console.log("In transaction");

  // Validate the input values (e.g., ensure they are numeric, not empty, etc.) as needed.
  if (amount <= 0) {
    return res.status(400).send('Invalid Amount.');
  }

  // Check if the sender exists in the UserAccounts table and if the sender has sufficient balance.
  const checkUserQuery = `
    SELECT UserID, AccountBalance
    FROM UserAccounts
    WHERE UserID = ?
      AND AccountBalance >= ?;
  `;

  db.query(checkUserQuery, [senderID, amount], (err, results) => {
    if (err) {
      console.error('SQL error: ' + err.message);
      return res.status(500).send('Internal server error');
    }

    if (results.length !== 1) {
      // Sender not found in the UserAccounts table or insufficient balance.
      console.log('Query to check user:', checkUserQuery, [senderID, amount]);
      return res.status(400).send('Sender not found or insufficient balance.');
    }

    // Update the sender's account balance by subtracting the transaction amount.
    const updateSenderBalanceQuery = `
      UPDATE UserAccounts
      SET AccountBalance = AccountBalance - ?
      WHERE UserID = ?;
    `;

    db.query(updateSenderBalanceQuery, [amount, senderID], (err, result) => {
      if (err) {
        console.error('SQL error: ' + err.message);
        return res.status(500).send('Internal server error');
      }

      // Transaction successfully recorded.
      console.log('Sender\'s account updated with the deducted amount.');

      // You can choose to update Admin's account here or send a success response.
      // For the sake of the example, let's assume you're updating Admin's account.
      const adminUserID = 3; // Replace with the actual Admin user ID
      const updateAdminBalanceQuery = `
        UPDATE UserAccounts
        SET AccountBalance = AccountBalance + ?
        WHERE UserID = ?;
      `;

      db.query(updateAdminBalanceQuery, [amount, adminUserID], (err, result) => {
        if (err) {
          console.error('SQL error: ' + err.message);
          return res.status(500).send('Internal server error');
        }

        // Record the transaction details in the 'Transactions' table.
        const insertTransactionQuery = `
        INSERT INTO Transactions (SenderUserID, ReceiverUserID, AmountTransferred, Status, Remarks)
        VALUES (?, ?, ?, 'Pending', ?);
        `;

        db.query(insertTransactionQuery, [senderID, payeeID, amount, remarks], (err, result) => {
          if (err) {
            console.error('SQL error: ' + err.message);
            return res.status(500).send('Internal server error');
          }

          console.log('Transaction details recorded in the Transactions table.');


        console.log('Admin\'s account updated with the transaction amount added.');

        // Introduce a 1-minute delay for reversal process here
        setTimeout(() => {
          // Assuming reversal process was not initiated, add the money to the payee's account.
          console.log(reversed)
          if(reversed)
          {
            console.log(reversed)
          const updateAdminBalanceQuery = `
        UPDATE UserAccounts
        SET AccountBalance = AccountBalance - ?
        WHERE UserID = ?;
      `;

      db.query(updateAdminBalanceQuery, [amount, adminUserID], (err, result) => {
        if (err) {
          console.error('SQL error: ' + err.message);
          return res.status(500).send('Internal server error');
        }

        console.log('Admin\'s account updated with the transaction amount added.');
          const updatePayeeBalanceQuery = `
            UPDATE UserAccounts
            SET AccountBalance = AccountBalance + ?
            WHERE UserID = ?;
          `;

          db.query(updatePayeeBalanceQuery, [amount, payeeID], (err, result) => {
            if (err) {
              console.error('SQL error: ' + err.message);
              return res.status(500).send('Internal server error');
            }
            console.log('Update Payee Balance Query:', updatePayeeBalanceQuery);
            console.log('Payee ID:', payeeID);

            console.log('Money successfully transferred to Payee\'s account.');
            res.status(200).send('Transaction successful');
          });
        });}
        }, 60000); // 1-minute delay
      });
    });
  });
});
});

// Handle transaction reversal
app.post('/reverse-transaction', (req, res) => {
  // Get the maximum transaction ID from the Transactions table
  const getMaxTransactionIDQuery = 'SELECT MAX(TransactionID) AS MaxTransactionID FROM Transactions';
  reversed = false;
  db.query(getMaxTransactionIDQuery, (err, maxTransactionResult) => {
    if (err) {
      console.error('SQL error: ' + err.message);
      return res.status(500).send('Internal server error');
    }

    const maxTransactionID = maxTransactionResult[0].MaxTransactionID;

    // Check if the transaction with the maximum ID is in 'Pending' status to allow reversal.
    const checkPendingStatusQuery = `
      SELECT TransactionID, Status, SenderUserID, AmountTransferred
      FROM Transactions
      WHERE TransactionID = ?
        AND Status = 'Pending';
    `;

    db.query(checkPendingStatusQuery, [maxTransactionID], (err, pendingResult) => {
      if (err) {
        console.error('SQL error: ' + err.message);
        return res.status(500).send('Internal server error');
      }

      if (pendingResult.length === 1) {
        // Transaction is still 'Pending', allow reversal.
        const senderID = pendingResult[0].SenderUserID;
        const amount = pendingResult[0].AmountTransferred;

        // Set the AdminUserID
        const AdminUserID = 3;

        // Subtract the amount from the Admin's account
        const subtractFromAdminQuery = `
          UPDATE UserAccounts
          SET AccountBalance = AccountBalance - ?
          WHERE UserID = ?;
        `;

        db.query(subtractFromAdminQuery, [amount, AdminUserID], (err, adminSubtractResult) => {
          if (err) {
            console.error('SQL error: ' + err.message);
            return res.status(500).send('Internal server error');
          }

          // Add the amount back to the sender's account
          const addToSenderQuery = `
            UPDATE UserAccounts
            SET AccountBalance = AccountBalance + ?
            WHERE UserID = ?;
          `;

          db.query(addToSenderQuery, [amount, senderID], (err, senderAddResult) => {
            if (err) {
              console.error('SQL error: ' + err.message);
              return res.status(500).send('Internal server error');
            }
            const updateTransactionStatusQuery = `
              UPDATE Transactions
              SET Status = 'Reversed'
              WHERE TransactionID = ?;
            `;

            db.query(updateTransactionStatusQuery, [maxTransactionID], (err, result) => {
              if (err) {
                console.error('SQL error: ' + err.message);
                return res.status(500).send('Internal server error');
              }

              //Payment successfully reversed.
              console.log('Payment reversal recorded for transaction ID:', maxTransactionID);
              res.status(200).send('Payment reversal successful');
            });
          });
        });
      } else {
        // Transaction is not in 'Pending' status, disallow reversal.
        res.status(400).send('Transaction cannot be reversed.');
      }
    });
   });
});
// Add a new endpoint to retrieve transaction history
app.get('/transactions', (req, res) => {
  // Query to retrieve transaction history, adjust as per your schema
  const getTransactionsQuery = `
    SELECT TransactionTime, TransactionID, Reversed, AmountTransferred
    FROM Transactions;
  `;

  db.query(getTransactionsQuery, (err, results) => {
    if (err) {
      console.error('SQL error: ' + err.message);
      return res.status(500).send('Internal server error');
    }

    // Send the transaction history data as a JSON response
    res.json(results);
  });
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
