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
import { GroupService } from './group.service';
import {
  AddParticipantGroupDto,
  CreateGroupDto,
  DeleteGroupDto,
  DeleteParticipantGroupDto,
  UpdateGroupDto,
} from 'src/dto/GroupDto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('group')
export class GroupController {
  constructor(private service: GroupService) {}

  @Get(':id')
  @ApiOperation({
    summary:
      'Return an Array of Groups, depending on a specific user ID, containing group ID, group name, group creator ID, an Array of group participants, date of creation and date of update.',
  })
  @ApiResponse({ status: 200, description: 'Groups successfuly returned.' })
  getAllGroups(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ) {
    return this.service.getAllGroups(id);
  }

  @Post()
  @ApiOperation({
    summary:
      'Creates a Group record, returning group ID, group name, group creator ID, date of creation and date of update. Json body expects: {name: string, creatorId: number}',
  })
  @ApiResponse({ status: 201, description: 'Group successfuly created.' })
  createGroup(@Body() createGoupDto: CreateGroupDto) {
    return this.service.createGroup(createGoupDto);
  }

  @Post('add-participant')
  @ApiOperation({
    summary:
      'The group creator Sends and receives in realtime a participation invitation through Websockets. Json body expects: {groupId: number, creatorId: number, groupName: string, newParticipantId: number}',
  })
  @ApiResponse({ status: 200, description: 'User accepted the request.' })
  addParticipants(@Body() addParticipantGoupDto: AddParticipantGroupDto) {
    return this.service.addParticipant(addParticipantGoupDto);
  }

  @Delete('delete-participant/:groupId/:creatorId/:participantId')
  @ApiOperation({
    summary: 'The group creator removes a participant.',
  })
  @ApiResponse({ status: 200, description: 'Participant successfuly deleted.' })
  deleteParticipants(
    @Param('groupId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    groupId: number,
    @Param('creatorId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    creatorId: number,
    @Param('participantId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    participantId: number,
  ) {
    const deleteParticipantGoupDto: DeleteParticipantGroupDto = {
      groupId,
      creatorId,
      participantId,
    };
    return this.service.deleteParticipant(deleteParticipantGoupDto);
  }

  @Put(':id')
  @ApiOperation({
    summary:
      'Updates a especific group name, returning group ID, group name, group creator ID, date of creation and date of update. Json body expects: {name?: string, creatorId: number}',
  })
  @ApiResponse({ status: 200, description: 'Group successfuly updated.' })
  updateGroup(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body() data: { name?: string; creatorId: number },
  ) {
    const updateGroupDto: UpdateGroupDto = {
      id,
      name: data.name,
      creatorId: data.creatorId,
    };

    return this.service.updateGroup(updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Deletes a especific group, returning group ID, group name, group creator ID, date of creation and date of update of the deleted group.',
  })
  @ApiResponse({ status: 200, description: 'Group successfuly deleted.' })
  deleteGroup(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body() data: { creatorId: number },
  ) {
    const deleteGroupDto: DeleteGroupDto = {
      id,
      creatorId: data.creatorId,
    };

    return this.service.deleteGroup(deleteGroupDto);
  }
}
