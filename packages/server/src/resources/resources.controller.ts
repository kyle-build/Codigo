import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Delete,
  Query,
  Get,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { TCurrentUser } from 'src/utils/GetUserMessageTool';
import { getUserMess } from 'src/utils/GetUserMessageTool';
import type { ResourcesRequest, DeleteResourcesRequest } from '@codigo/schema';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  /**
   * 资源上传控制器
   */
  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @getUserMess() user: TCurrentUser,
    @Body() body: ResourcesRequest,
  ) {
    return this.resourcesService.upload(file, body.type, user.id);
  }

  // 删除资源控制器
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async deleteResource(
    @getUserMess() user: TCurrentUser,
    @Query() params: DeleteResourcesRequest,
  ) {
    return this.resourcesService.deleteResource(params.id, user.id);
  }

  // 资源获取的控制器
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getResources(
    @getUserMess() user: TCurrentUser,
    @Query() params: ResourcesRequest,
  ) {
    return this.resourcesService.getResources(params.type, user.id);
  }
}
