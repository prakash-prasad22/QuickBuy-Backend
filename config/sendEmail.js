import { createTransport } from "nodemailer"
import dotenv from 'dotenv'

dotenv.config()

const sendEmail = async ({sendTo, subject, html}) => {
  try {
    let transporter = createTransport({
      service : 'gmail',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASS,
      },
    })

    let info = await transporter.sendMail({
      from: `QuickBuy`, // sender address
      to: sendTo, // list of receivers
      subject: subject, // Subject line
      html: html, // html body
    })
    return info
  } catch (error) {
    return error.message
  }
}

export default sendEmail


