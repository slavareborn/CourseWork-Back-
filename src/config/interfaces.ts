export interface IDbConfig {
  database: string;
  host: string;
  port: number;
  user: string;
  password: string;
}

/**
 * App common config
 */
export interface IConfig {
  port: number;
  database: IDbConfig;
}
