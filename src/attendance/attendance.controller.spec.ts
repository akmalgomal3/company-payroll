import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let service: AttendanceService;

  const mockAttendanceRepository = {};
  const mockUser = { userId: 'test-user-uuid', role: 'employee' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockAttendanceRepository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AttendanceController>(AttendanceController);
    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkIn', () => {
    it('should call AttendanceService.submitAttendance with correct userId', async () => {
      const serviceResponse = {
        message: 'Attendance submitted successfully.',
        attendance: { id: 'new-attendance-uuid' } as Attendance,
      };

      const submitAttendanceSpy = jest
        .spyOn(service, 'submitAttendance')
        .mockResolvedValue(serviceResponse);

      const result = await controller.checkIn(mockUser);

      expect(submitAttendanceSpy).toHaveBeenCalledWith(mockUser.userId);
      expect(result.message).toEqual(serviceResponse.message);
      expect(result.data).toEqual(serviceResponse.attendance);
    });
  });
});
