import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/enums/role.enum';
import { Salary } from '../../payroll/entities/salary.entity';
import { faker } from '@faker-js/faker';
import { PasswordHelper } from '../helpers/password.helper';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Salary)
    private readonly salaryRepository: Repository<Salary>,
    private readonly passwordHelper: PasswordHelper,
  ) {}

  async onModuleInit() {
    this.logger.log('Checking if seeding is required...');
    const userCount = await this.userRepository.count();
    if (userCount === 0) {
      this.logger.log('No users found. Starting database seeding...');
      await this.seed();
      this.logger.log('Seeding completed.');
    } else {
      this.logger.log('Database already contains data. Skipping seeding.');
    }
  }

  private async seed() {
    await this.seedAdmin();
    await this.seedEmployees();
  }

  private async seedAdmin() {
    const adminPassword = await this.passwordHelper.hash('AdminPassword123');
    const admin = this.userRepository.create({
      username: 'admin',
      password: adminPassword,
      role: Role.Admin,
    });
    await this.userRepository.save(admin);
  }

  private async seedEmployees() {
    for (let i = 0; i < 100; i++) {
      const employeePassword = await this.passwordHelper.hash(`Password123`);
      const employee = this.userRepository.create({
        username: faker.internet.username().toLowerCase() + i,
        password: employeePassword,
        role: Role.Employee,
      });

      const savedEmployee = await this.userRepository.save(employee);

      const salary = this.salaryRepository.create({
        amount: faker.number.int({ min: 5000000, max: 15000000 }),
        user: savedEmployee,
      });
      await this.salaryRepository.save(salary);
    }
  }
}
