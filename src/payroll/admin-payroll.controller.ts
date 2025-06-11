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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { AuthUser } from '../auth/decorators/user.decorator';
import { IpAddress } from '../auth/decorators/ip-address.decorator';

@ApiTags('Admin - Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/payroll')
export class AdminPayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('period')
  @ApiOperation({ summary: 'Admin creates a new payroll period' })
  @ApiResponse({
    status: 201,
    description: 'Payroll period created successfully.',
  })
  async createPayrollPeriod(
    @AuthUser() admin: { userId: string },
    @Body() createPayrollPeriodDto: CreatePayrollPeriodDto,
    @IpAddress() ip: string,
  ) {
    const period = await this.payrollService.createPayrollPeriod(
      createPayrollPeriodDto,
      admin.userId,
      ip,
    );
    return {
      message: 'Payroll period created successfully',
      data: period,
    };
  }

  @Post('run/:periodId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin runs payroll for a specific period' })
  @ApiResponse({ status: 200, description: 'Payroll processed successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Payroll has already been run for this period.',
  })
  async runPayroll(
    @AuthUser() admin: { userId: string },
    @Param('periodId', ParseUUIDPipe) periodId: string,
    @IpAddress() ip: string,
    @Request() req: any,
  ) {
    await this.payrollService.runPayroll(
      periodId,
      admin.userId,
      ip,
      req.requestId,
    );
    return {
      message: `Payroll for period ID ${periodId} has been processed successfully.`,
    };
  }

  @Get('summary/:periodId')
  @ApiOperation({
    summary: 'Admin generates a summary of all employee payslips',
  })
  async getPayrollSummary(@Param('periodId', ParseUUIDPipe) periodId: string) {
    const summary = await this.payrollService.getPayrollSummary(periodId);
    return {
      message: 'Payroll summary retrieved successfully',
      data: summary,
    };
  }
}
