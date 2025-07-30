import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { DeleteUserDto, UpdateUserDto } from 'src/dto/UserDto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  @ApiOperation({
    summary:
      'Return an Array of users containing ID, Username, date of creation and date of update.',
  })
  @ApiResponse({ status: 200, description: 'Users successfuly returned.' })
  getAllUsers() {
    return this.service.getAllUsers();
  }

  @Put(':id')
  @ApiOperation({
    summary:
      'Update an users name or password. Json body expects: {userName?: string, password: string, newPassword?: string, confirmNewPassword?: string}.',
  })
  @ApiResponse({ status: 200, description: 'Users successfuly updated.' })
  updateUser(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.service.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an user.',
  })
  @ApiResponse({ status: 200, description: 'Users successfuly deleted.' })
  deleteUser(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    return this.service.deleteUser(id, deleteUserDto);
  }
}
