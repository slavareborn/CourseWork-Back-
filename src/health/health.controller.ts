import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { LogMethod } from 'decorator/log.decorator';

@Controller('/health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}
  @Get()
  @LogMethod('log')
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.http.pingCheck('prod', process.env.URL_BACKEND_PROD),
      async () => this.db.pingCheck('database'),
    ]);
  }
}
