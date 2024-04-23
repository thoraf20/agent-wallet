import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      global: true,
      signOptions: {
        expiresIn: 3600,
      },
    }),
    TypeOrmModule.forFeature([Wallet]),
  ],
  controllers: [WalletController],
  providers: [WalletService, Repository],
  exports: [WalletService],
})
export class WalletModule {}
