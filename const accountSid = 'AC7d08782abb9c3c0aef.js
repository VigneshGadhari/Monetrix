const readline = require('readline');

// Function to generate and verify OTP via email

  // Custom message to include in the email
  const customMessage = 'Thank you for Choosing Monetrix YOUR OTP FOR MONETRIX IS:';

  // Send the OTP via email
  sendOTP(email, otp, customMessage)
    .then(() => {
      console.log('OTP sent via email for verification');
      console.log('Secret:', secret.base32);
      promptForOTP(email, otp, secret);
    })
    .catch((error) => {
      console.error('Error sending OTP email: ' + error);
    });
}

// Function to prompt the user for OTP input
function promptForOTP(email, expectedOTP, secret) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the OTP sent to your email: ', (userOTP) => {
    rl.close();

    const verified = speakeasy.totp.verify({
      secret: secret.base32,
      token: userOTP,
      step: 30,
    });

    if (verified) {
      console.log('OTP verified successfully');
    } else {
      console.log('OTP verification failed');
    }
  });
}

// Run OTP generation and verification
generateAndVerifyOTP('vigneshgameryt@gmail.com'); // Replace with the recipient's email
