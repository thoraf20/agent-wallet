import {
  Body,
  ConflictException,
  Controller,
  Headers,
  Logger,
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
  async createWallet(
    @Headers('Authorization') token: string,
    @Body() walletData: CreateWalletDto,
  ) {
    try {
      // Verify and decode JWT token
      // const agentInfo = this.verifyToken(token);
      // Check if the agent exists
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

  @Post()
  async fundWallet(
    @Headers('Authorization') token: string,
    @Body() walletData: FundWalletDto,
  ) {
    try {
      // Verify and decode JWT token
      // const agentInfo = this.verifyToken(token);
      // Check if the agent exists
      const agent = await this.walletService.findWalletByAgentId(
        walletData.agentId,
      );

      if (!agent) {
        throw new ConflictException('Agent not found');
      }

      const wallet = await this.walletService.fundWallet(walletData);

      return new SuccessResponseObject('wallet funded successfully.', wallet);
    } catch (error) {
      this.logger.error(`Fund wallet error. ${error.message}`, error.stack);
      ErrorResponseObject(error);
    }
  }

  @Post()
  async internalTransfer(
    @Headers('Authorization') token: string,
    @Body() walletData: TransferDto,
  ) {
    try {
      // Verify and decode JWT token
      // const agentInfo = this.verifyToken(token);
      // Check if the agent exists
      // const agent = await this.walletService.findWalletByAgentId(
      //   walletData.agentId,
      // );

      // if (!agent) {
      //   throw new ConflictException('Agent not found');
      // }

      const wallet = await this.walletService.internalTransfer(walletData);

      return new SuccessResponseObject('wallet funded successfully.', wallet);
    } catch (error) {
      this.logger.error(
        `Internal transfer error. ${error.message}`,
        error.stack,
      );
      ErrorResponseObject(error);
    }
  }
}
