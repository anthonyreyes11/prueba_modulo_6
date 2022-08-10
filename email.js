const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mbensan.test@gmail.com',
    pass: 'dgdxbpvqozekxwkn'
  }
})

const enviar = {
  from: 'mbensan.test@gmail.com',
  to: 'getzutv@gmail.com,camilonintendo@gmail.com, anthonyreyesus@outlook.com,gregory.rcz@gmail.com',
  subject: 'importante',
  text: 'El Anthony te manda un saludo!'
}


module.exports = { transport, enviar }