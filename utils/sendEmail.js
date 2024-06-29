// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {

//     const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: process.env.SMTP_PORT,
//         secure: false,
//         auth: {
//             user: process.env.SMTP_EMAIL,
//             port: process.env.SMTP_PASSWORD,
//         },
//         tls:{
//             rejectUnauthorized : false
//         },

//     });

//     const message ={
//         from: process.env.SMTP_EMAIL,
//         to: options.mail,
//         subject: options.subject,
//         message: options.emailBody
//     }

//     const info = await transporter.sendMail(message);
//     console.log ("Message sent");

// };


// module.exports = sendEmail;


const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL, // SMTP email
            pass: process.env.SMTP_PASSWORD // SMTP password
        },
        tls: {
            rejectUnauthorized: false
        },
    });

    const message = {
        from: process.env.SMTP_EMAIL, // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.emailBody // plain text body
        // or use html: options.emailBody if the email body is in HTML format
    };

    try {
        const info = await transporter.sendMail(message);
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email: %s", error);
    }
};

module.exports = sendEmail;
