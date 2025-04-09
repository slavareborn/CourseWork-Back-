import { IConfig } from './interfaces';

export default (): IConfig => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
});
