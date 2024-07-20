// emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendOrderConfirmationEmail = (userEmail, orderDetails) => {
  const mailOptions = {
    from: 'noreply@qlaudio.com',
    to: userEmail,
    subject: 'Order Confirmation',
    text: `Your order has been placed successfully.\n\nOrder Details:\n${JSON.stringify(orderDetails, null, 2)}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Order confirmation email sent: %s', info.response);
  });
};

module.exports = { sendOrderConfirmationEmail };