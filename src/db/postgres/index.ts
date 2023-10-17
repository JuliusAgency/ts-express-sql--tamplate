import { PostgresDataSource } from "./postgres-data-source";

export const initPostgresDataSource = async () => {
  PostgresDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization:", err);
    });
};
