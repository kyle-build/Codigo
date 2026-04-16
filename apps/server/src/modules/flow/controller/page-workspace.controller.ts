import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type {
  PageWorkspaceExplorerResponse,
  PageWorkspaceFileResponse,
  PageWorkspaceIDEConfigResponse,
  PageWorkspaceResponse,
  PutPageWorkspaceFileRequest,
  PutPageWorkspaceFileResponse,
} from '@codigo/schema';
import { getUserMess } from 'src/shared/helpers/current-user.helper';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';
import type { Request } from 'express';
import { PageWorkspaceService } from 'src/modules/flow/service/page-workspace.service';

@Controller('pages')
export class PageWorkspaceController {
  constructor(private readonly pageWorkspaceService: PageWorkspaceService) {}

  @Get(':id/workspace')
  @UseGuards(AuthGuard('jwt'))
  async getWorkspace(
    @Param('id', ParseIntPipe) pageId: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<{ data: PageWorkspaceResponse }> {
    return {
      data: await this.pageWorkspaceService.getWorkspace(pageId, user),
    };
  }

  @Post(':id/workspace')
  @UseGuards(AuthGuard('jwt'))
  async syncWorkspace(
    @Param('id', ParseIntPipe) pageId: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<{ data: PageWorkspaceResponse }> {
    return {
      data: await this.pageWorkspaceService.syncWorkspace(pageId, user),
    };
  }

  @Get(':id/workspace/explorer')
  @UseGuards(AuthGuard('jwt'))
  async getExplorer(
    @Param('id', ParseIntPipe) pageId: number,
    @getUserMess() user: TCurrentUser,
  ): Promise<{ data: PageWorkspaceExplorerResponse }> {
    return {
      data: await this.pageWorkspaceService.getExplorer(pageId, user),
    };
  }

  @Get(':id/workspace/file')
  @UseGuards(AuthGuard('jwt'))
  async readFile(
    @Param('id', ParseIntPipe) pageId: number,
    @Query('path') filePath: string,
    @getUserMess() user: TCurrentUser,
  ): Promise<{ data: PageWorkspaceFileResponse }> {
    return {
      data: await this.pageWorkspaceService.readWorkspaceFile(
        pageId,
        filePath,
        user,
      ),
    };
  }

  @Put(':id/workspace/file')
  @UseGuards(AuthGuard('jwt'))
  async writeFile(
    @Param('id', ParseIntPipe) pageId: number,
    @Body() body: PutPageWorkspaceFileRequest,
    @getUserMess() user: TCurrentUser,
  ): Promise<{ data: PutPageWorkspaceFileResponse }> {
    return {
      data: await this.pageWorkspaceService.writeWorkspaceFile(pageId, body, user),
    };
  }

  @Get(':id/workspace/ide-config')
  @UseGuards(AuthGuard('jwt'))
  async getIDEConfig(
    @Param('id', ParseIntPipe) pageId: number,
    @getUserMess() user: TCurrentUser,
    @Req() req: Request,
  ): Promise<{ data: PageWorkspaceIDEConfigResponse }> {
    return {
      data: await this.pageWorkspaceService.getIDEConfig(pageId, user, {
        origin: req.headers.origin,
      }),
    };
  }

  @Post(':id/workspace/ide-config')
  @UseGuards(AuthGuard('jwt'))
  async startIDEConfig(
    @Param('id', ParseIntPipe) pageId: number,
    @getUserMess() user: TCurrentUser,
    @Req() req: Request,
  ): Promise<{ data: PageWorkspaceIDEConfigResponse }> {
    return {
      data: await this.pageWorkspaceService.getIDEConfig(pageId, user, {
        origin: req.headers.origin,
      }),
    };
  }
}

