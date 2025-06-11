import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { getDay } from 'date-fns';

// Entities
import { User } from '../users/entities/user.entity';
import { PayrollPeriod } from './entities/payroll-period.entity';
import { Payslip } from './entities/payslip.entity';
import { Overtime } from './entities/overtime.entity';
import { Reimbursement } from './entities/reimbursement.entity';
import { Attendance } from '../attendance/entities/attendance.entity';

// DTOs
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { SubmitOvertimeDto } from './dto/submit-overtime.dto';
import { SubmitReimbursementDto } from './dto/submit-reimbursement.dto';
import { Role } from '../users/enums/role.enum';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    @InjectRepository(PayrollPeriod)
    private readonly periodRepo: Repository<PayrollPeriod>,
    @InjectRepository(Payslip)
    private readonly payslipRepo: Repository<Payslip>,
    @InjectRepository(Overtime)
    private readonly overtimeRepo: Repository<Overtime>,
    @InjectRepository(Reimbursement)
    private readonly reimbursementRepo: Repository<Reimbursement>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    private readonly auditService: AuditService,
  ) {}

  async createPayrollPeriod(
    dto: CreatePayrollPeriodDto,
    adminId: string,
    ipAddress: string,
  ): Promise<PayrollPeriod> {
    const newPeriod = this.periodRepo.create({
      ...dto,
      createdBy: adminId,
      updatedBy: adminId,
      ipAddress: ipAddress,
    });
    return this.periodRepo.save(newPeriod);
  }

  async runPayroll(
    periodId: string,
    adminId: string,
    ipAddress: string,
    requestId: string,
  ): Promise<void> {
    const period = await this.periodRepo.findOneBy({ id: periodId });
    if (!period)
      throw new NotFoundException(
        `Payroll period with ID ${periodId} not found.`,
      );
    if (period.isProcessed)
      throw new BadRequestException(
        `Payroll for period ${periodId} has already been run.`,
      );

    const employees = await this.userRepo.find({
      where: { role: Role.Employee },
      relations: ['salary'],
    });

    for (const employee of employees) {
      if (!employee.salary || !employee.salary.amount) {
        this.logger.warn(
          `Employee ${employee.username} (ID: ${employee.id}) has no salary. Skipping.`,
        );
        continue;
      }

      const workingDaysInPeriod = this.getWorkingDays(
        period.startDate,
        period.endDate,
      );
      const baseSalary = +employee.salary.amount;
      const hourlyRate = baseSalary / (workingDaysInPeriod * 8);

      const attendanceCount = await this.attendanceRepo.count({
        where: {
          user: { id: employee.id },
          isProcessed: false,
          checkInTime: Between(period.startDate, period.endDate),
        },
      });
      const proratedSalary =
        (attendanceCount / workingDaysInPeriod) * baseSalary;

      const overtimes = await this.overtimeRepo.find({
        where: {
          userId: employee.id,
          isProcessed: false,
          date: Between(period.startDate, period.endDate),
        },
      });
      const totalOvertimeHours = overtimes.reduce(
        (sum, ot) => sum + ot.hours,
        0,
      );
      const overtimePay = totalOvertimeHours * hourlyRate * 2;

      const reimbursements = await this.reimbursementRepo.find({
        where: {
          userId: employee.id,
          isProcessed: false,
          date: Between(period.startDate, period.endDate),
        },
      });
      const reimbursementTotal = reimbursements.reduce(
        (sum, r) => sum + +r.amount,
        0,
      );

      const takeHomePay = proratedSalary + overtimePay + reimbursementTotal;

      const newPayslip = this.payslipRepo.create({
        user: employee,
        payrollPeriod: period,
        baseSalary,
        proratedSalary,
        overtimePay,
        reimbursementTotal,
        takeHomePay,
        createdBy: adminId,
        updatedBy: adminId,
        ipAddress: ipAddress,
        details: {
          attendance: {
            count: attendanceCount,
            totalDays: workingDaysInPeriod,
          },
          overtime: { totalHours: totalOvertimeHours },
          reimbursements: reimbursements.map((r) => ({
            description: r.description,
            amount: r.amount,
          })),
        },
      });
      await this.payslipRepo.save(newPayslip);

      await this.attendanceRepo.update(
        {
          user: { id: employee.id },
          checkInTime: Between(period.startDate, period.endDate),
        },
        { isProcessed: true, updatedBy: adminId, ipAddress: ipAddress },
      );
      await this.overtimeRepo.update(
        {
          userId: employee.id,
          date: Between(period.startDate, period.endDate),
        },
        { isProcessed: true, updatedBy: adminId, ipAddress: ipAddress },
      );
      await this.reimbursementRepo.update(
        {
          userId: employee.id,
          date: Between(period.startDate, period.endDate),
        },
        { isProcessed: true, updatedBy: adminId, ipAddress: ipAddress },
      );
    }

    period.isProcessed = true;
    period.updatedBy = adminId;
    period.ipAddress = ipAddress;
    await this.periodRepo.save(period);

    await this.auditService.log({
      userId: adminId,
      action: 'RUN_PAYROLL',
      entity: 'PayrollPeriod',
      entityId: periodId,
      ipAddress: ipAddress,
      requestId: requestId, // <-- Simpan requestId
      details: {
        message: `Payroll for period ${period.id} was processed successfully.`,
      },
    });
  }

  async getPayrollSummary(periodId: string): Promise<any> {
    const payslips = await this.payslipRepo.find({
      where: { payrollPeriod: { id: periodId } },
      relations: ['user'],
    });

    if (payslips.length === 0) {
      throw new NotFoundException(
        `No payslip data found for period ID ${periodId}.`,
      );
    }

    const employeePayslips = payslips.map((p) => ({
      employeeId: p.user.id,
      username: p.user.username,
      takeHomePay: p.takeHomePay,
    }));

    const totalPayout = employeePayslips.reduce(
      (sum, p) => sum + +p.takeHomePay,
      0,
    );

    return { employeePayslips, totalPayout };
  }

  async submitOvertime(
    userId: string,
    dto: SubmitOvertimeDto,
    ipAddress: string,
  ): Promise<Overtime> {
    const now = new Date();
    const submissionDate = new Date(dto.date);

    // Can only submit after 5 PM
    if (now.getHours() < 17) {
      throw new BadRequestException(
        'Overtime can only be submitted after 5 PM.',
      );
    }

    const newOvertime = this.overtimeRepo.create({
      ...dto,
      userId: userId,
      createdBy: userId,
      updatedBy: userId,
      ipAddress: ipAddress,
    });
    return this.overtimeRepo.save(newOvertime);
  }

  async submitReimbursement(
    userId: string,
    dto: SubmitReimbursementDto,
    ipAddress: string,
  ): Promise<Reimbursement> {
    const newReimbursement = this.reimbursementRepo.create({
      ...dto,
      userId: userId,
      createdBy: userId,
      updatedBy: userId,
      ipAddress: ipAddress,
    });
    return this.reimbursementRepo.save(newReimbursement);
  }

  async getEmployeePayslip(userId: string, periodId: string): Promise<Payslip> {
    const payslip = await this.payslipRepo.findOne({
      where: {
        user: { id: userId },
        payrollPeriod: { id: periodId, isProcessed: true },
      },
    });

    if (!payslip) {
      throw new NotFoundException(
        `Payslip for you in period ${periodId} is not available or not yet processed.`,
      );
    }
    return payslip;
  }

  private getWorkingDays(start: Date | string, end: Date | string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);

    let count = 0;
    const curDate = new Date(startDate.getTime());

    while (curDate <= endDate) {
      const dayOfWeek = getDay(curDate);
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Not Sunday or Saturday
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }
}
