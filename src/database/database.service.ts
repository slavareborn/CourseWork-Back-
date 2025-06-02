import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LogMethod } from '../decorator/log.decorator';

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  @LogMethod('log')
  async dropDatabase(databaseName: string): Promise<void> {
    await this.dataSource.query(
      `SELECT pg_terminate_backend(pg_stat_activity.pid)
       FROM pg_stat_activity
       WHERE pg_stat_activity.datname = $1
       AND pid <> pg_backend_pid();`,
      [databaseName],
    );

    await this.dataSource.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
  }
}
