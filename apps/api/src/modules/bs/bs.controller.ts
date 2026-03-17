import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { BsService } from './bs.service';
import { CreateBsDto } from './dto/create-bs.dto';
import { UpdateBsDto } from './dto/update-bs.dto';

@Controller('building-spot')
export class BsController {
  constructor(private readonly bsService: BsService) {}

  @Post()
  create(@Body() createBsDto: CreateBsDto) {
    return this.bsService.create(createBsDto);
  }

  @Get()
  findAll() {
    return this.bsService.findAll();
  }

  @Get('email/:email')
  findOneByEmail(@Param('email') email: string) {
    return this.bsService.findOneByEmail(email);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bsService.findOne(id);
  }

  @Put(':id')
  replace(@Param('id', ParseIntPipe) id: number, @Body() updateBsDto: UpdateBsDto) {
    return this.bsService.replace(id, updateBsDto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBsDto: UpdateBsDto) {
    return this.bsService.update(id, updateBsDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bsService.remove(id);
  }
}
