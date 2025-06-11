import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';

const RealDate = Date;

function mockDate(fakeDate: string | Date) {
  // @ts-ignore
  global.Date = class extends RealDate {
    constructor(dateString?: string | number | Date) {
      if (dateString) {
        super(dateString);
      } else {
        super(fakeDate);
      }
    }
  };
}

describe('AttendanceService', () => {
  let service: AttendanceService;
  let attendanceRepository: Partial<Repository<Attendance>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    attendanceRepository = module.get(getRepositoryToken(Attendance));
  });

  afterEach(() => {
    global.Date = RealDate;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitAttendance', () => {
    it('should throw BadRequestException if it is a weekend (Saturday)', async () => {
      mockDate('2025-10-11T10:00:00Z'); // Ini hari Sabtu
      await expect(
        service.submitAttendance('user-id', '127.0.0.1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if it is a weekend (Sunday)', async () => {
      mockDate('2025-10-12T10:00:00Z'); // Ini hari Minggu
      await expect(
        service.submitAttendance('user-id', '127.0.0.1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return existing attendance if already checked in today', async () => {
      mockDate('2025-10-13T10:00:00Z'); // Ini hari Senin
      const existingAttendance = new Attendance();
      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(
        existingAttendance,
      );

      const result = await service.submitAttendance('user-id', '127.0.0.1');

      expect(attendanceRepository.save).not.toHaveBeenCalled();
      expect(result.message).toContain('already submitted');
    });

    it('should create and save a new attendance if valid', async () => {
      const fakeDateString = '2025-10-13T11:00:00Z';
      mockDate(fakeDateString); // Senin

      const userId = 'user-uuid-123';
      const ipAddress = '127.0.0.1';
      const mockAttendanceData = {
        user: { id: userId },
        checkInTime: new Date(fakeDateString),
        createdBy: userId,
        updatedBy: userId,
        ipAddress,
      };
      const createdAttendance = { ...mockAttendanceData, id: 'att-uuid' };

      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(null);
      (attendanceRepository.create as jest.Mock).mockReturnValue(
        createdAttendance,
      );
      (attendanceRepository.save as jest.Mock).mockResolvedValue(
        createdAttendance,
      );
      await service.submitAttendance(userId, ipAddress);
      expect(attendanceRepository.create).toHaveBeenCalledWith(
        mockAttendanceData,
      );
      expect(attendanceRepository.save).toHaveBeenCalledWith(createdAttendance);
    });
  });
});
