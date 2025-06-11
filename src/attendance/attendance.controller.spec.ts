import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BadRequestException } from '@nestjs/common';
import { Attendance } from './entities/attendance.entity';

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let service: AttendanceService;

  const mockAttendanceService = {
    submitAttendance: jest.fn(),
  };

  const mockUser = { userId: 'test-user-uuid', role: 'employee' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
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
    it('should call AttendanceService.submitAttendance with correct userId and ip', async () => {
      const mockIp = '127.0.0.1';
      const serviceResponse = {
        message: 'Attendance submitted successfully.',
        attendance: { id: 'new-attendance-uuid' } as Attendance,
      };

      jest
        .spyOn(service, 'submitAttendance')
        .mockResolvedValue(serviceResponse);

      const result = await controller.checkIn(mockUser, mockIp);

      expect(service.submitAttendance).toHaveBeenCalledWith(
        mockUser.userId,
        mockIp,
      );
      expect(result.message).toEqual(serviceResponse.message);
      expect(result.data).toEqual(serviceResponse.attendance);
    });

    it('should propagate exceptions from the service', async () => {
      const mockIp = '127.0.0.1';
      jest
        .spyOn(service, 'submitAttendance')
        .mockRejectedValue(
          new BadRequestException('Cannot submit on weekend.'),
        );

      await expect(controller.checkIn(mockUser, mockIp)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
