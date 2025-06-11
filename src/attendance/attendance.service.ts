import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { startOfDay, endOfDay, getDay } from 'date-fns';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async submitAttendance(
    userId: string,
    ipAddress: string,
  ): Promise<{ message: string; attendance: Attendance }> {
    const today = new Date();

    // Sunday = 0, Saturday = 6
    const dayOfWeek = getDay(today);

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new BadRequestException('Cannot submit attendance on weekends.');
    }

    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        checkInTime: Between(startOfToday, endOfToday),
      },
    });

    if (existingAttendance) {
      return {
        message: 'Attendance for today already submitted.',
        attendance: existingAttendance,
      };
    }

    const newAttendance = this.attendanceRepository.create({
      user: { id: userId },
      checkInTime: today,
      createdBy: userId,
      updatedBy: userId,
      ipAddress: ipAddress,
    });

    const savedAttendance = await this.attendanceRepository.save(newAttendance);
    return {
      message: 'Attendance submitted successfully.',
      attendance: savedAttendance,
    };
  }
}
