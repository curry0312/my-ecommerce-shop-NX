import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs"; // EJS lets you write HTML files that have embedded JavaScript snippets.
import path from "path";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

//EJS Template
const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  // Point to the path of your EJS template
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "auth-service",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );
  //Insert javascript data to template html and return the html
  const html = await ejs.renderFile(templatePath, data);
  return html;
};

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  data: Record<string, any>;
}

//Send Email
export const sendEmail = async ({
  to,
  subject,
  templateName,
  data,
}: SendEmailOptions): Promise<boolean> => {
  try {
    const html = await renderEmailTemplate(templateName, data);
    const mailOptions = { from: process.env.SMTP_USER, to, subject, html };
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
