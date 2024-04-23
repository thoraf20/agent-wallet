import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  agentId: string;
}

export class FundWalletDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  agentId: string;

  @IsNumber()
  amount: number;
}
