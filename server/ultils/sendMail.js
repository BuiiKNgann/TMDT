const nodemailer = require('nodemailer')
const asyncHandler = require('express-async-handler')

const sendMail = asyncHandler(async ({ email, html }) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_NAME, // your email
            pass: process.env.EMAIL_APP_PASSWORD, // app password from Google
        },
    });

    try {
        let info = await transporter.sendMail({
            from: `"Cuahangdientu" <${process.env.EMAIL_NAME}>`, // sender address
            to: email, // list of receivers
            subject: "Forgot password", // Subject line
            html: html, // html body
        });
        return info
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
})

module.exports = sendMail
