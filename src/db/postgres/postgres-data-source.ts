import { AppConfig } from "../../configuration/ApplicationConfig";
import { DataSource } from "typeorm";

export const PostgresDataSource = new DataSource(AppConfig.dataSource);
