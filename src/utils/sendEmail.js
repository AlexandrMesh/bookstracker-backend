const nodemailer = require("nodemailer");

const sendEmail = async ({ email, code }) => {

  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: 'eisven@yandex.ru',
      pass: 'passruchka',
    },
  });

  return await transporter.sendMail({
    from: '"Alex 👻" <eisven@yandex.ru>',
    to: email,
    subject: "Hello ✔",
    html: `<b>Your code: ${code}</b>`,
  });
}

module.exports = { sendEmail };
