import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'utils/PublicDecorator';
import { AppService } from './app.service';
import { CreateUserDto } from './dto/UserDto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private service: AppService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary:
      'Public route. Register an User. Json body expects: {userName: string, password: string, confirmPassword: string}.',
  })
  @ApiResponse({ status: 201, description: 'Users successfuly registered.' })
  register(@Body() createUser: CreateUserDto) {
    return this.service.register(createUser);
  }
}
