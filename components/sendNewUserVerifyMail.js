import nodemailer from "nodemailer";

// send verification mail to user with email and password
const sendNewUserVerifyMail = async (name, email, password, user_id, subject, url) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMPT_EMAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMPT_EMAIL,
      to: email,
      bcc: process.env.SMPT_EMAIL,
      subject: subject,
      html: `<p>Hello ${name}, admin add you as user, please click here to <a href="${url}=${user_id}">verify</a> your email. <br><br> <b>Email : </b> ${email} <br> <b>Password : </b> ${password} </p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been send : ", info.response);
      }
    });
  } catch (error) {
    console.log("Error :: sendNewUserVerifyMail :: ", error.message);
  }
};

export default sendNewUserVerifyMail;
