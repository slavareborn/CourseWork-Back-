import { Injectable } from '@nestjs/common';
import {
  AuthHeaders,
  AuthStrategy,
} from '../interfaces/auth-strategy.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy implements AuthStrategy {
  private token: string;
  private expiresAt: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly payload: any,
  ) {}

  async getAuthHeaders(): Promise<AuthHeaders> {
    if (this.isTokenExpired()) {
      await this.refreshToken();
    }
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  isTokenExpired(): boolean {
    return !this.token || (this.expiresAt && Date.now() >= this.expiresAt);
  }

  async refreshToken(): Promise<void> {
    this.token = await this.jwtService.signAsync(this.payload);
    const decoded = this.jwtService.decode(this.token) as { exp: number };
    this.expiresAt = decoded.exp * 1000; // Convert to milliseconds
  }
}
