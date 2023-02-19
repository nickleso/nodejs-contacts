const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENGRID_API_KEY } = process.env;

sgMail.setApiKey(SENGRID_API_KEY);

const sendEmail = async (data) => {
  const email = { ...data, from: "nickleso.work@gmail.com" };
  try {
    await sgMail.send(email);
    return true;
  } catch (error) {
    console.log("mail error", error);
  }
};

module.exports = sendEmail;
