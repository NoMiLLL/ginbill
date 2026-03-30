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
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ActiveBs } from 'src/common/decorators/active-bs.decorator';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto, @ActiveBs() bs: any) {
    return this.customerService.create(createCustomerDto, bs.id);
  }

  @Get()
  findAll(@ActiveBs() bs: any) {
    return this.customerService.findAll(bs.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @ActiveBs() bs: any) {
    return this.customerService.findOne(id, bs.id);
  }

  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @ActiveBs() bs: any,
  ) {
    return this.customerService.replace(id, updateCustomerDto, bs.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @ActiveBs() bs: any,
  ) {
    return this.customerService.update(id, updateCustomerDto, bs.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @ActiveBs() bs: any) {
    return this.customerService.remove(id, bs.id);
  }
}
