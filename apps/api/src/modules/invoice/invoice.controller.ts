import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ActiveBs } from 'src/common/decorators/active-bs.decorator';

@UseGuards(AuthGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @ActiveBs() bs: any,
  ) {
    return this.invoiceService.create(createInvoiceDto, bs.id);
  }

  @Get()
  findAll(@ActiveBs() bs: any) {
    return this.invoiceService.findAll(bs.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @ActiveBs() bs: any,
  ) {
    return this.invoiceService.findOne(id, bs.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @ActiveBs() bs: any,
  ) {
    return this.invoiceService.update(id, updateInvoiceDto, bs.id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @ActiveBs() bs: any,
  ) {
    return this.invoiceService.remove(id, bs.id);
  }
}
