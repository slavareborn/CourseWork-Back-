import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

describe('AppService', () => {
  let appService: AppService;
  let configServiceMock: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        Logger,
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
  });

  describe('getPort', () => {
    it('should return the port from ConfigService', () => {
      configServiceMock.get.mockReturnValue('3000');

      const port = appService.getPort();

      expect(port).toBe('3000');
      expect(configServiceMock.get).toHaveBeenCalledWith('PORT');
    });
  });

  describe('getDatabaseUrl', () => {
    it('should return the database URL from ConfigService', () => {
      configServiceMock.get.mockReturnValue(
        'postgresql://user:password@localhost:5432/dbname',
      );

      const databaseUrl = appService.getDatabaseUrl();

      expect(databaseUrl).toBe(
        'postgresql://user:password@localhost:5432/dbname',
      );
      expect(configServiceMock.get).toHaveBeenCalledWith('DATABASE_URL');
    });
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const helloMessage = appService.getHello();

      expect(helloMessage).toBe('Hello World!');
    });
  });
});
