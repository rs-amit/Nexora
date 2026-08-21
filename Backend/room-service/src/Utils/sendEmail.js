import nodemailer from "nodemailer"


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yourtestemail@gmail.com",
    pass: "abcdefghijklmnop"
  },
//   EMAIL_USER=yourtestemail@gmail.com
// EMAIL_PASS=abcd efgh ijkl mnop
//   secure:true,
//   port: 465
})


export const sendEmail = async ({ to, subject, html }) => {
  
  console.log("its working----------------")
  console.log("EMAIL_USER", process.env.EMAIL_USER)
  console.log("EMAIL_PASS", process.env.EMAIL_PASS)

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  }

  console.log("mailOptions", mailOptions)

  return transporter.sendMail(mailOptions)
}