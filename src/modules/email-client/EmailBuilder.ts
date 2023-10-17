import handlebars from "handlebars";

import type { EmailBaseOptions } from "./EmailService";
import { getEmailResources } from "./EmailClientConfig";

export type EmailParams = {
  email: string;
  name: string;
  [key: string]: string;
};

export type EmailResources = {
  pre?(params: EmailParams): EmailParams;
  template: string;
  indexedParamsNames: Array<string>;
  subject: string;
};

export const buildEmailOptions = (
  emailName: string,
  emaiParams: EmailParams
): EmailBaseOptions => {
  const resources = getEmailResources(emailName);
  return emailOptionslBuilder(resources, emaiParams);
};

const getIndexedParamKey = (name: string) => {
  const symbol = Symbol();
  let obj = { [symbol]: name };
  let { [symbol]: key } = obj;
  return key;
};

const emailOptionslBuilder = (
  resources: EmailResources,
  params: EmailParams
): EmailBaseOptions => {
  if (resources.pre) {
    params = resources.pre(params);
  }
  const paramsList: { [key: string]: string } = {};
  resources.indexedParamsNames.forEach((name) => {
    const alias = getIndexedParamKey(name);
    paramsList[alias] = params[alias];
  });
  const options: EmailBaseOptions = {
    to: params.email,
    subject: resources.subject,
    html: handlebars.compile(resources.template)({ ...paramsList }),
  };
  return options;
};
