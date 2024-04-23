import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto, FundWalletDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async createWallet(walletData: CreateWalletDto) {
    const agentWallet = await this.walletRepository.save({
      agentId: walletData.agentId,
      balance: 0,
    });

    return agentWallet;
  }

  async findWalletByAgentId(agentId: string) {
    const wallet = await this.walletRepository.findOne({
      where: { agentId },
    });

    if (wallet) {
      return wallet;
    } else {
      throw new NotFoundException('wallet not found');
    }
  }

  async fundWallet(walletData: FundWalletDto) {
    const { agentId, amount } = walletData;
    const wallet = await this.findWalletByAgentId(agentId);

    const updatedBalance = wallet.balance + amount;

    await this.walletRepository.update(
      { agentId },
      { balance: updatedBalance },
    );

    return 'wallet balance updated successfully';
  }
}
