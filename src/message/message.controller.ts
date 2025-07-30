import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { MessageService } from './message.service';
import {
  CreateMessageDto,
  DeleteMessageDto,
  GetMessagesDto,
  UpdateMessageDto,
} from 'src/dto/MessageDto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('message')
export class MessageController {
  constructor(private service: MessageService) {}

  @Get(':belonger/:chat_or_group_id/:skip/:take')
  @ApiOperation({
    summary:
      'This API operation has an especific aim because it needs to return an array of messages depending on a specific chat or group ID (to be specified in place of ":belonger/" parameter if the messages belongs to a chat or group. If from a chat then in place of ":belonger/" will be "chat/". If from a group, the same but like "group/"), and then two integer numbers for skip and take, to create a limit of how much messages are going to be fatched. This request returns message id, message text, message user ID who sent the message, chat or group ID from where belongs the message, date of creation and date of update.',
  })
  @ApiResponse({ status: 200, description: 'Messages successfuly returned.' })
  getAllMessages(
    @Param('belonger') belonger: string,
    @Param('chat_or_group_id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    chatOrGroupId: number,
    @Param('skip', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    skip: number,
    @Param('take', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    take: number,
  ) {
    const getMessagesDto: GetMessagesDto = { belonger, chatOrGroupId };
    return this.service.getAllMessages(skip, take, getMessagesDto);
  }

  @Post()
  @ApiOperation({
    summary:
      'Creates a message record, returning message id, message text, message user ID who sent the message, chat or group ID from where belongs the message, date of creation and date of update. Json body expects: {userId: number, text: string, chatId?: number, groupId?: number}.',
  })
  @ApiResponse({ status: 201, description: 'Message successfuly created.' })
  createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.service.createMessage(createMessageDto);
  }

  @Put(':id')
  @ApiOperation({
    summary:
      'Updates a message "text", returning message id, message text, message user ID who sent the message, chat or group ID from where belongs the message, date of creation and date of update. Json body expects: {userId: number, text: string, chatId?: number, groupId?: number}.',
  })
  @ApiResponse({ status: 200, description: 'Message successfuly updated.' })
  upateMessage(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.service.updateMessage(id, updateMessageDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Deletes a message, returning message id, message text, message user ID who sent the message, chat or group ID from where belongs the message, date of creation and date of update from the deleted message.',
  })
  @ApiResponse({ status: 200, description: 'Message successfuly deleted.' })
  deleteMessage(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    id: number,
    @Body() deleteMessageDto: DeleteMessageDto,
  ) {
    return this.service.deleteMessage(id, deleteMessageDto);
  }
}
