import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

interface Configuration {
  application: {
    port: number;
  };
  dataSource: PostgresConnectionOptions;
  session: {
    secret: string;
    name: string;
    saveUninitialized: boolean;
    cookie: {
      secure: boolean;
      sameSite: string | "strict" | "none" | "lax" | undefined;
      httpOnly: boolean;
      maxAge: number;
      domain: string | undefined;
    };
    resave: boolean;
  };
  sessionStorage: {
    uri: string;
    db: string;
    collection: string;
  };
  saltWork: number;
}

export const AppConfig: Configuration = {
  application: {
    port: parseInt(process.env.PORT ? process.env.PORT : "8080"),
  },
  dataSource: {
    type: "postgres",
    host: process.env.DB_HOST || "129.159.132.178",
    port: parseInt(process.env.DB_PORT ? process.env.DB_PORT : "5432"),
    username: process.env.DB_USERNAME || "gil_user",
    password: process.env.DB_PASSWORD || "gil_pwd",
    database: process.env.DB_NAME || "Adisol-dev",
    schema: process.env.SCHEMA_NAME || "adisol",
    logging: process.env.LOGGING === "true" || true,
    entities: ["./src/entities/**/*.ts"],
    maxQueryExecutionTime: parseInt(
      process.env.MAX_QUERY_EXECUTION_TIME
        ? process.env.MAX_QUERY_EXECUTION_TIME
        : "50000"
    ),
  },
  session: {
    secret: process.env.SESSION_SECRET || "This is a secret",
    name: process.env.SESSION_NAME || "connect.sid",
    saveUninitialized: process.env.SESSION_SAVE_UNINITIALIZED === "true",
    cookie: {
      secure: process.env.COOKIE_SECURE === "true" || false,
      sameSite: process.env.COOKIE_SAME_SITE || "lax",
      httpOnly: process.env.COOKIE_HTTP_ONLY === "true" || true,
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || "3600000"),
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
    resave: process.env.SESSION_RESAVE === "true" || true,
  },
  sessionStorage: {
    uri: process.env.SESSION_STORAGE_URI || "mongodb://localhost:27017",
    db: process.env.SESSION_STORAGE_DB || "session",
    collection: process.env.SESSION_STORAGE_COLLECTION || "sessions",
  },
  saltWork: parseInt(process.env.SALT_WORK_FACTOR || "10"),
};
