import { Test, TestingModule } from '@nestjs/testing';
import { AdminPayrollController } from './admin-payroll.controller';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { PayrollPeriod } from './entities/payroll-period.entity';

describe('AdminPayrollController', () => {
  let controller: AdminPayrollController;
  let service: PayrollService;

  const mockAdminUser = { userId: 'admin-uuid', role: 'admin' };
  const mockPayrollService = {
    createPayrollPeriod: jest.fn(),
    runPayroll: jest.fn(),
    getPayrollSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminPayrollController],
      providers: [{ provide: PayrollService, useValue: mockPayrollService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminPayrollController>(AdminPayrollController);
    service = module.get<PayrollService>(PayrollService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createPayrollPeriod on service with correct arguments', async () => {
    const dto: CreatePayrollPeriodDto = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };
    const mockIp = '192.168.1.1';
    jest
      .spyOn(service, 'createPayrollPeriod')
      .mockResolvedValue(new PayrollPeriod());

    await controller.createPayrollPeriod(mockAdminUser, dto, mockIp);

    expect(service.createPayrollPeriod).toHaveBeenCalledWith(
      dto,
      mockAdminUser.userId,
      mockIp,
    );
  });

  it('should call runPayroll on service with correct arguments', async () => {
    const periodId = 'some-period-uuid';
    const mockIp = '192.168.1.1';
    const mockReq = { requestId: 'mock-req-id' };
    jest.spyOn(service, 'runPayroll').mockResolvedValue(undefined);

    await controller.runPayroll(mockAdminUser, periodId, mockIp, mockReq);

    expect(service.runPayroll).toHaveBeenCalledWith(
      periodId,
      mockAdminUser.userId,
      mockIp,
      mockReq.requestId,
    );
  });

  it('should call getPayrollSummary on service with correct arguments', async () => {
    const periodId = 'some-period-uuid';
    jest.spyOn(service, 'getPayrollSummary').mockResolvedValue({});

    await controller.getPayrollSummary(periodId);

    expect(service.getPayrollSummary).toHaveBeenCalledWith(periodId);
  });
});
