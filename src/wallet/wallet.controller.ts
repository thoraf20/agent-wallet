import {
  Body,
  ConflictException,
  Controller,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CreateWalletDto, FundWalletDto, TransferDto } from './dto/wallet.dto';
import { ErrorResponseObject, SuccessResponseObject } from 'src/common/http';

@ApiTags('Wallet')
@Controller('wallets')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(private walletService: WalletService) {}

  @Post()
  async createWallet(@Body() walletData: CreateWalletDto) {
    try {
      const agent = await this.walletService.findWalletByAgentId(
        walletData.agentId,
      );

      if (agent) {
        throw new ConflictException('Agent wallet already created');
      }

      const wallet = await this.walletService.createWallet(walletData);

      return new SuccessResponseObject('wallet successfully created.', wallet);
    } catch (error) {
      this.logger.error(`Create wallet error. ${error.message}`, error.stack);
      ErrorResponseObject(error);
    }
  }

  @Post('/fund')
  async fundWallet(@Body() walletData: FundWalletDto) {
    try {
      const wallet = await this.walletService.fundWallet(walletData);

      return new SuccessResponseObject('wallet funded successfully.', wallet);
    } catch (error) {
      this.logger.error(`Fund wallet error. ${error.message}`, error.stack);
      ErrorResponseObject(error);
    }
  }

  @Post('/transfer')
  async internalTransfer(@Body() walletData: TransferDto) {
    try {
      await this.walletService.internalTransfer(walletData);

      return new SuccessResponseObject('fund transfer successfully.', null);
    } catch (error) {
      this.logger.error(
        `Internal transfer error. ${error.message}`,
        error.stack,
      );
      ErrorResponseObject(error);
    }
  }

  @Get('/mine/:agentId')
  async fetchWallet(@Param('agentId') agentId: string) {
    try {
      const wallet = await this.walletService.findWalletByAgentId(agentId);

      return new SuccessResponseObject('wallet fetch successfully.', wallet);
    } catch (error) {
      this.logger.error(`Fetch wallet error. ${error.message}`, error.stack);
      ErrorResponseObject(error);
    }
  }
}
