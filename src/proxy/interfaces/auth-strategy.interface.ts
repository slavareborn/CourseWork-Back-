export interface AuthHeaders {
  [key: string]: string;
}

export interface AuthStrategy {
  getAuthHeaders(): Promise<AuthHeaders>;
  isTokenExpired?(): boolean;
  refreshToken?(): Promise<void>;
}

export enum AuthType {
  API_KEY = 'API_KEY',
  JWT = 'JWT',
  OAUTH = 'OAUTH',
}
