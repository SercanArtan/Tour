const nodemailer = require('nodemailer');
const pug = require('pug')
const htmlToText = require('html-to-text')

// The complex part
// new Email(user, url).sendWelcome()
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email,
        this.firstName = user.name.split(' ')[0],
        this.url = url,
        this.from = 'Kazim <"kdf@jonas.io">'
    }

    newTransport() {
        nodemailer.createTransport({
        service: 'Email',
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    }
    // Send tha actual email 
    async send(template, subject){
        // 1) render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        }

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome() {
        await this.send()
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password token is valid only for 10 mins')
    }
}
// the end of complex part



// The first part
/*
const sendEmail = async options => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'Email',
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // 2) Define the email options
    const mailOptions = {
        from: 'Kazim <"kdf@jonas.io">',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // 3) Actually send the email
    await transporter.sendMail(mailOptions)
    
}

module.exports = sendEmail;
*/