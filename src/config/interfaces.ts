export interface IDbConfig {
  database: string;
  host: string;
  port: number;
  user: string;
  password: string;
}

export interface IAuthConfig {
  jwt: Record<string, string>;
  google: Record<string, string>;
}
/**
 * App common config
 */
export interface IConfig {
  port: number;
  database: IDbConfig;
  auth: IAuthConfig;
}
