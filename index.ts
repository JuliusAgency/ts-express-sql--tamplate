import { initServer } from "./src/common/initServer";
import { initPostgresDataSource } from "./src/db/postgres/index";

initPostgresDataSource();
// initializeMongo();
initServer();
