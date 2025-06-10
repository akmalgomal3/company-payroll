import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class SubmitReimbursementDto {
  @ApiProperty({ example: '2025-08-11' })
  @IsDateString()
  date: Date;

  @ApiProperty({ example: 75000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'Transportation for client meeting' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
