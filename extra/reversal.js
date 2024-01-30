const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

// Serve the main page.
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/main.html');
});
// Serve the money transfer page.
app.get('/transfer', (req, res) => {
    res.sendFile(__dirname + '/public/transfer.html');
});

// Handle the payment reversal request.
app.post('/reversal', (req, res) => {
    const senderUsername = req.body.senderUsername;
    const receiverUsername = req.body.receiverUsername;
    const transferAmount = parseFloat(req.body.transferAmount);

    // Find sender and receiver accounts based on the usernames.
    const sender = users.find(user => user.username === senderUsername);
    const receiver = users.find(user => user.username === receiverUsername);

    if (!sender || !receiver) {
        return res.status(400).send('Sender or receiver not found');
    }

    if (sender.balance < transferAmount) {
        return res.status(400).send('Insufficient balance for the transfer');
    }

    // Simulate waiting for a confirmation for 1 minute.
    setTimeout(() => {
        res.status(200).send('Payment reversal successful.');
    }, 60000);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

