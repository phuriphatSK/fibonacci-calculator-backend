import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { FibonacciCalculation } from 'src/fibonacci/entities/fibonacci-calculation.entity';
import { User } from 'src/users/entities/user.entity';

export const mysql = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    entities: [User, FibonacciCalculation],
    synchronize: configService.get('NODE_ENV') !== 'production', // Only sync in development
    logging: configService.get('NODE_ENV') !== 'production',
  }),
  inject: [ConfigService],
};
