import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  Max,
  Min,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class SubmitOvertimeDto {
  @ApiProperty({ example: '2025-08-10' })
  @IsDateString()
  date: Date;

  @ApiProperty({ description: 'Number of hours, max 3', example: 2 })
  @IsInt()
  @Min(1)
  @Max(3)
  hours: number;

  @ApiProperty({ example: 'Fixing critical deployment issue' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
