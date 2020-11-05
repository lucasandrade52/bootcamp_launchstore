const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "029188eab1b0ae",
    pass: "17c9ae514c321e"
  }
});