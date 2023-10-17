import nodemailer from "nodemailer";

import { transportConfig } from "./EmailClientConfig";

export type EmailBaseOptions = {
  from?: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?:string,
  html: string;
};
  
// create reusable transporter object using the default SMTP transport
const transporter =  nodemailer.createTransport({
  service: transportConfig.name,
  auth: {
    user: transportConfig.user,
    pass: transportConfig.pass,
  }
});

export const sendEmail = async (options: EmailBaseOptions) => {
  return transporter.sendMail({
    from: options.from,
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
};