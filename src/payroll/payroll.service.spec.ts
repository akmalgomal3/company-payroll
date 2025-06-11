import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PayrollPeriod } from './entities/payroll-period.entity';
import { Payslip } from './entities/payslip.entity';
import { Overtime } from './entities/overtime.entity';
import { Reimbursement } from './entities/reimbursement.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { AuditService } from '../audit/audit.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Role } from '../users/enums/role.enum';
import { Salary } from './entities/salary.entity';

type MockRepository<T = any> = {
  findOneBy: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  count: jest.Mock;
  update: jest.Mock;
};

describe('PayrollService', () => {
  let service: PayrollService;
  let periodRepo: MockRepository;
  let payslipRepo: MockRepository;
  let overtimeRepo: MockRepository;
  let reimbursementRepo: MockRepository;
  let userRepo: MockRepository;
  let attendanceRepo: MockRepository;
  let mockAuditService: { log: jest.Mock };

  beforeEach(async () => {
    const createMockRepo = () => ({
      findOneBy: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    });
    mockAuditService = { log: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: getRepositoryToken(PayrollPeriod),
          useValue: createMockRepo(),
        },
        { provide: getRepositoryToken(Payslip), useValue: createMockRepo() },
        { provide: getRepositoryToken(Overtime), useValue: createMockRepo() },
        {
          provide: getRepositoryToken(Reimbursement),
          useValue: createMockRepo(),
        },
        { provide: getRepositoryToken(User), useValue: createMockRepo() },
        { provide: getRepositoryToken(Attendance), useValue: createMockRepo() },
        { provide: getRepositoryToken(Salary), useValue: {} },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
    periodRepo = module.get(getRepositoryToken(PayrollPeriod));
    payslipRepo = module.get(getRepositoryToken(Payslip));
    overtimeRepo = module.get(getRepositoryToken(Overtime));
    reimbursementRepo = module.get(getRepositoryToken(Reimbursement));
    userRepo = module.get(getRepositoryToken(User));
    attendanceRepo = module.get(getRepositoryToken(Attendance));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runPayroll', () => {
    const mockPeriod = {
      id: 'period-uuid',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-31'),
      isProcessed: false,
    } as PayrollPeriod;
    const mockEmployee = {
      id: 'employee-uuid',
      username: 'testuser',
      role: Role.Employee,
      salary: { amount: 22000000 } as Salary,
    } as User;

    it('should correctly calculate and save a payslip', async () => {
      periodRepo.findOneBy.mockResolvedValue(mockPeriod);
      userRepo.find.mockResolvedValue([mockEmployee]);
      attendanceRepo.count.mockResolvedValue(20); // Hadir 20 hari
      overtimeRepo.find.mockResolvedValue([{ hours: 5 }] as Overtime[]); // Lembur 5 jam
      reimbursementRepo.find.mockResolvedValue([
        { amount: 150000 },
      ] as Reimbursement[]); // Reimbursement 150rb
      payslipRepo.create.mockImplementation((dto) => dto);
      payslipRepo.save.mockResolvedValue({});

      await service.runPayroll(
        'period-uuid',
        'admin-uuid',
        '127.0.0.1',
        'req-id',
      );

      expect(payslipRepo.save).toHaveBeenCalled();
      const savedPayslip = payslipRepo.save.mock.calls[0][0];

      // --- PERHITUNGAN YANG BENAR (berdasarkan 23 hari kerja) ---
      // Gaji Prorata = (20 / 23) * 22,000,000 = 19,130,434.78
      // Upah per jam = 22,000,000 / (23 * 8) = 119,565.21
      // Upah Lembur = 5 * (119,565.21 * 2) = 1,195,652.17
      // Total = 19,130,434.78 + 1,195,652.17 + 150,000 = 20,476,086.95

      expect(savedPayslip.baseSalary).toBe(22000000);
      expect(savedPayslip.proratedSalary).toBeCloseTo(19130434.78);
      expect(savedPayslip.overtimePay).toBeCloseTo(1195652.17);
      expect(savedPayslip.reimbursementTotal).toBe(150000);
      expect(savedPayslip.takeHomePay).toBeCloseTo(20476086.956);
    });

    it('should throw NotFoundException if period not found', async () => {
      periodRepo.findOneBy.mockResolvedValue(null);
      await expect(
        service.runPayroll('wrong-id', 'admin-id', 'ip', 'req-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if period is already processed', async () => {
      periodRepo.findOneBy.mockResolvedValue({
        ...mockPeriod,
        isProcessed: true,
      });
      await expect(
        service.runPayroll('period-uuid', 'admin-id', 'ip', 'req-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
