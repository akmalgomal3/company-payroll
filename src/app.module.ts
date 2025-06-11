import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PayrollModule } from './payroll/payroll.module';
import { AttendanceModule } from './attendance/attendance.module';
import { SeederService } from './shared/database/seeder.service';
import { User } from './users/entities/user.entity';
import { Salary } from './payroll/entities/salary.entity';
import { SharedModule } from './shared/shared.module';
import { AuditModule } from './audit/audit.module';
import { RequestIdMiddleware } from './shared/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true, // true untuk development, false untuk production
      }),
    }),
    TypeOrmModule.forFeature([User, Salary]),
    SharedModule,
    UsersModule,
    AuditModule,
    AuthModule,
    PayrollModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
