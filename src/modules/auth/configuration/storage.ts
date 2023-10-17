import MongoStore from "connect-mongo";
import { AppConfig } from "src/configuration/ApplicationConfig";

export const sessionStorage = (): MongoStore => {
  const uri = AppConfig.sessionStorage.uri;
  const db = AppConfig.sessionStorage.db;
  const collection = AppConfig.sessionStorage.collection;

  // Create session storage
  return MongoStore.create({
    mongoUrl: uri,
    dbName: db,
    collectionName: collection,
    ttl: 20000,
  });
};
