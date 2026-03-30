import { Module } from '@nestjs/common';
import { BsService } from './bs.service';
import { BsController } from './bs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingSpot } from './entities/bs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BuildingSpot])],
  controllers: [BsController],
  providers: [BsService],
  exports: [BsService],
})
export class BsModule {}
