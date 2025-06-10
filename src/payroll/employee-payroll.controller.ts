import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { SubmitOvertimeDto } from './dto/submit-overtime.dto';
import { SubmitReimbursementDto } from './dto/submit-reimbursement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { AuthUser } from '../auth/decorators/user.decorator';

@ApiTags('Employee - Actions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Employee)
@Controller('employee')
export class EmployeePayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('overtime')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Employee submits an overtime request' })
  async submitOvertime(
    @AuthUser() user,
    @Body() submitOvertimeDto: SubmitOvertimeDto,
  ) {
    const overtime = await this.payrollService.submitOvertime(
      user.userId,
      submitOvertimeDto,
    );
    return {
      message: 'Overtime submitted successfully',
      data: overtime,
    };
  }

  @Post('reimbursement')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Employee submits a reimbursement request' })
  async submitReimbursement(
    @AuthUser() user,
    @Body() submitReimbursementDto: SubmitReimbursementDto,
  ) {
    const reimbursement = await this.payrollService.submitReimbursement(
      user.userId,
      submitReimbursementDto,
    );
    return {
      message: 'Reimbursement submitted successfully',
      data: reimbursement,
    };
  }

  @Get('payslip/:periodId')
  @ApiOperation({
    summary: 'Employee generates their payslip for a specific period',
  })
  @ApiResponse({
    status: 404,
    description: 'Payslip not found or payroll not yet processed.',
  })
  async getMyPayslip(
    @AuthUser() user,
    @Param('periodId', ParseUUIDPipe) periodId: string,
  ) {
    const payslip = await this.payrollService.getEmployeePayslip(
      user.userId,
      periodId,
    );
    return {
      message: 'Payslip retrieved successfully',
      data: payslip,
    };
  }
}
