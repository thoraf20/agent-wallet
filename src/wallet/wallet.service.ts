import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto, FundWalletDto, TransferDto } from './dto/wallet.dto';

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

  async fundWallet(dto: FundWalletDto) {
    return this.walletRepository.manager.transaction(async (entityManager) => {
      const { agentId, amount } = dto;

      const wallet = await entityManager.findOne(Wallet, {
        where: { agentId },
      });

      if (!wallet) {
        throw new NotFoundException('wallet not found');
      }

      wallet.balance += amount;

      return await entityManager.save([wallet]);
    });
  }

  async internalTransfer(dto: TransferDto) {
    return this.walletRepository.manager.transaction(async (entityManager) => {
      const senderWallet = await entityManager.findOne(Wallet, {
        where: { agentId: dto.senderId },
      });

      if (!senderWallet) {
        throw new NotFoundException('Sender wallet not found');
      }

      const receiverWallet = await entityManager.findOne(Wallet, {
        where: { agentId: dto.receiverId },
      });

      if (!receiverWallet) {
        throw new NotFoundException('Receiver wallet not found');
      }

      if (senderWallet.balance < dto.amount) {
        throw new UnprocessableEntityException('Insufficient funds');
      }

      senderWallet.balance -= dto.amount;
      receiverWallet.balance = receiverWallet.balance + dto.amount;

      return await entityManager.save([senderWallet, receiverWallet]);
    });
  }
}
