// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = "AC7d08782abb9c3c0aeff061bd9e68288a";
const authToken = "52ea547f9e63bf0366168fa5bd7e4c9c";
const verifySid = "VA1f7772779e60c0ef5d3d3e4a0f3d0647";
const client = require("twilio")(accountSid, authToken);
phoneNumber = 8928881094;
const formattedPhoneNumber = "+91" + phoneNumber;

client.verify.v2
  .services(verifySid)
  .verifications.create({ to: formattedPhoneNumber, channel: "sms" })
  // .then((verification) => console.log(verification.status))
  // .then(() => {
  //   const readline = require("readline").createInterface({
  //     input: process.stdin,
  //     output: process.stdout,
  //   });
  //   readline.question("Please enter the OTP:", (otpCode) => {
  //     client.verify.v2
  //       .services(verifySid)
  //       .verificationChecks.create({ to: formattedPhoneNumber, code: otpCode })
  //       .then((verification_check) => console.log(verification_check.status))
  //       .then(() => readline.close());
   