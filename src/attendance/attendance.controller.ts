import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { AuthUser } from '../auth/decorators/user.decorator';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @Roles(Role.Employee)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Employee submits their attendance for the day' })
  @ApiResponse({
    status: 200,
    description: 'Attendance submitted or already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot submit attendance on a weekend',
  })
  async checkIn(@AuthUser() user: { userId: string }) {
    const result = await this.attendanceService.submitAttendance(user.userId);
    return {
      message: result.message,
      data: result.attendance,
    };
  }
}
