import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FibonacciService } from './fibonacci.service';
import { CalculateFibonacciDto } from './dto/calculate-fibonacci.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('fibonacci')
@UseGuards(JwtAuthGuard)
export class FibonacciController {
  constructor(private readonly fibonacciService: FibonacciService) {}

  @Post('calculate')
  async calculate(
    @Body() calculateDto: CalculateFibonacciDto,
    @CurrentUser() user: User,
  ) {
    return this.fibonacciService.calculateFibonacci(calculateDto.index, user);
  }

  @Get('history')
  async getHistory(
    @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.fibonacciService.getUserCalculations(user.id, page, limit);
  }

  @Get('stats')
  async getStats(@CurrentUser() user: User) {
    return this.fibonacciService.getCalculationStats(user.id);
  }
}
