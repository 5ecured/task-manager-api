const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'edward.ottorino@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'edward.ottorino@gmail.com',
        subject: 'Goodbye!',
        text: `See ya, ${name}!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}