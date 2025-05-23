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
  auth: {
    jwt: {
      secret:
        process.env.JWT_SECRET ||
        'default_super_secret_key_do_not_use_in_production',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3000/auth/google/callback',
    },
  },
});
