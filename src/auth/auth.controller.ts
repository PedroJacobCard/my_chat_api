import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginDto } from 'src/dto/UserDto';
import { AuthService } from './auth.service';
import { Public } from 'utils/PublicDecorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  @ApiOperation({
    summary:
      'Public route. Login into an User account to return user credentials. Json body expects: {userName: string, password: string}.',
  })
  @ApiResponse({ status: 200, description: 'Users successfuly logedin.' })
  signIn(@Body() loginDto: LoginDto) {
    return this.service.signIn(loginDto);
  }
}
