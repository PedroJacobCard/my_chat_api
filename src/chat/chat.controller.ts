import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from 'src/dto/ChatDto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('chat')
export class ChatController {
  constructor(private service: ChatService) {}

  @Get(':id')
  @ApiOperation({
    summary:
      'Return an Array of chats, depending on a specific user ID, containing chat ID and an Array of chat participants.',
  })
  @ApiResponse({ status: 200, description: 'Chats successfuly returned.' })
  getAllChats(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    return this.service.getAllChats(id);
  }

  @Post()
  @ApiOperation({
    summary:
      'Sends a request and receive a response in realtime using Websockets, to create a chat record, returning chat ID and an Array of chat participants. Json body expects: {fromUserId: number, fromUserName: string, toUserId: number}',
  })
  @ApiResponse({ status: 201, description: 'User accepted the request.' })
  createChat(@Body() createChatDto: CreateChatDto) {
    return this.service.createChat(createChatDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Delete a specific chat depending on an ID given in the parameter, returning chat ID and an Array of chat participants of the deleted chat',
  })
  @ApiResponse({ status: 200, description: 'Chat successfuly deleted.' })
  deleteChat(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ) {
    return this.service.deleteChat(id);
  }
}
