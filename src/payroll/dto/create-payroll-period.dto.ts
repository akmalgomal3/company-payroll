import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CreatePayrollPeriodDto {
  @ApiProperty({ example: '2025-08-01' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ example: '2025-08-31' })
  @IsDateString()
  endDate: Date;
}
