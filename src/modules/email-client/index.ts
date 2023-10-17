import { buildEmailOptions } from "./EmailBuilder";
import { setEmailResources } from "./EmailClientConfig";
import { sendEmail } from "./EmailService";

export const emailClientImpl = {
  setEmailResources: setEmailResources,
  buildEmailOptions: buildEmailOptions,
  sendEmail: sendEmail,
};