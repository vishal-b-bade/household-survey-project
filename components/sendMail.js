import nodemailer from "nodemailer";

// for reset password send mail
const sendMail = async (name, email, urlValue, subject, url) => {
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
      subject: `For ${subject}`,
      html: `<p>Hello ${name}, please click here <a href="${url}=${urlValue}">To ${subject}</a> your password.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(
          "Error :: reset_transporter_mailOptions :: ",
          error.message
        );
      } else {
        console.log("Email has been send : ", info.response);
      }
    });
  } catch (error) {
    console.log("Error :: sendMail :: ", error.message);
  }
};

export default sendMail;
