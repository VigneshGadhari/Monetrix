const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const readline = require('readline');

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'shideshwargca24@gmail.com',    // Your email address
    pass: 'vwlz dcyv mofz pudy',     // Your email password (consider using environment variables)
  },
});

// Function to send an OTP via email
function sendOTP(email, otp) {
  const mailOptions = {
    from: 'shideshwargca24@gmail.com',
    to: 'vigneshgameryt@gmail.com',
    subject: 'Your OTP for Verification',
    text: OTP =  otp,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve('OTP email sent: ' + info.response);
      }
    });
  });
}

// Function to generate and verify OTP via email
function generateAndVerifyOTP(email) {
  // Generate an OTP secret
  const secret = speakeasy.generateSecret({
    length: 10,
    name: 'MyApp',
    issuer: 'MyApp',
  });

  // Generate the OTP
  const otp = speakeasy.totp({
    secret: secret.base32,
    step: 30, // OTP changes every 30 seconds
  });

  // Send the OTP via email
  sendOTP(email, otp)
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
