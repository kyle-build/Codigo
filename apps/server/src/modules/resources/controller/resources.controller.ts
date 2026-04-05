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
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ResourcesService } from 'src/modules/resources/service/resources.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';
import { getUserMess } from 'src/shared/helpers/current-user.helper';
import type { ResourcesRequest, DeleteResourcesRequest } from '@codigo/schema';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}
  /**
   * 上传资源
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

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadResource(
    @UploadedFile() file: Express.Multer.File,
    @getUserMess() user: TCurrentUser,
    @Body() body: ResourcesRequest,
  ) {
    return this.resourcesService.upload(file, body.type, user.id);
  }

  /**
   * 删除资源
   */
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async deleteResource(
    @getUserMess() user: TCurrentUser,
    @Query() params: DeleteResourcesRequest,
  ) {
    return this.resourcesService.deleteResource(params.id, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteResourceById(
    @getUserMess() user: TCurrentUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.resourcesService.deleteResource(id, user.id);
  }

  /**
   * 获取资源
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getResources(
    @getUserMess() user: TCurrentUser,
    @Query() params: ResourcesRequest,
  ) {
    return this.resourcesService.getResources(params.type, user.id);
  }
}
