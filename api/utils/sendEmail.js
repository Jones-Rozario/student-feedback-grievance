import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Debug: Check if environment variables are loaded
console.log("Email configuration check:");
console.log(
  "EMAIL_USER:",
  process.env.EMAIL_USER ? process.env.EMAIL_USER : "Not set"
);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Set" : "Not set");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email provider
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

export async function sendEmail({ to, subject, text, html }) {
  // Check if credentials are available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email credentials not configured. Please check EMAIL_USER and EMAIL_PASS environment variables."
    );
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
}
