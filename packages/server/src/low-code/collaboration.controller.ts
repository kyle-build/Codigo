import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LowCodeService } from './low-code.service';
import type { TCurrentUser } from '../utils/GetUserMessageTool';
import { getUserMess } from '../utils/GetUserMessageTool';
import type {
  InviteCollaboratorRequest,
  UpdateCollaboratorRoleRequest,
} from '@codigo/schema';

@Controller('pages/:pageId/collaborators')
@UseGuards(AuthGuard('jwt'))
export class CollaborationController {
  constructor(private readonly lowCodeService: LowCodeService) {}

  @Get()
  async getCollaborators(@Param('pageId', ParseIntPipe) pageId: number) {
    return this.lowCodeService.getCollaborators(pageId);
  }

  @Post()
  async inviteCollaborator(
    @Param('pageId', ParseIntPipe) pageId: number,
    @Body() body: InviteCollaboratorRequest,
    @getUserMess() user: TCurrentUser,
  ) {
    return this.lowCodeService.inviteCollaborator(pageId, body, user.id);
  }

  @Put(':userId')
  async updateCollaboratorRole(
    @Param('pageId', ParseIntPipe) pageId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Body() body: UpdateCollaboratorRoleRequest,
    @getUserMess() user: TCurrentUser,
  ) {
    return this.lowCodeService.updateCollaboratorRole(
      pageId,
      targetUserId,
      body,
      user.id,
    );
  }

  @Delete(':userId')
  async removeCollaborator(
    @Param('pageId', ParseIntPipe) pageId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @getUserMess() user: TCurrentUser,
  ) {
    return this.lowCodeService.removeCollaborator(pageId, targetUserId, user.id);
  }
}
