import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

  async dropDatabase(databaseName: string): Promise<void> {
    try {
      await this.dataSource.query(
        `SELECT pg_terminate_backend(pg_stat_activity.pid)
         FROM pg_stat_activity
         WHERE pg_stat_activity.datname = $1
         AND pid <> pg_backend_pid();`,
        [databaseName],
      );
      this.logger.log(
        `Terminated active connections for database: ${databaseName}`,
      );

      await this.dataSource.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
      this.logger.log(`Database "${databaseName}" dropped successfully.`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to drop database: ${databaseName}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Failed to drop database: ${databaseName}, unknown error.`,
        );
      }
      throw error;
    }
  }
}
