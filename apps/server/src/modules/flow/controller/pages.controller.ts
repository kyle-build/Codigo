import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type {
  PageWorkspaceIDEConfigResponse,
  PageWorkspaceExplorerResponse,
  PageWorkspaceFileResponse,
  PageWorkspaceResponse,
  PageWorkspaceRuntimeResponse,
  PageWorkspaceSessionResponse,
  PostQuestionDataRequest,
  PostReleaseRequest,
  PutPageWorkspaceFileRequest,
  PutPageWorkspaceFileResponse,
  UpdateReleaseConfigRequest,
} from '@codigo/schema';
import { OptionalJwtAuthGuard } from 'src/core/guard/optional-jwt.guard';
import {
  GetUserAgent,
  GetUserIP,
  getUserMess,
} from 'src/shared/helpers/current-user.helper';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';
import { PageAnalyticsService } from 'src/modules/flow/service/page-analytics.service';
import { PageReleaseService } from 'src/modules/flow/service/page-release.service';
import { SecretTool } from 'src/shared/utils/secret.tool';

@Controller('pages')
export class PagesController {
  constructor(
    private readonly secretTool: SecretTool,
    private readonly pageReleaseService: PageReleaseService,
    private readonly pageAnalyticsService: PageAnalyticsService,
  ) {}

  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  upsertMyPage(
    @Body() body: PostReleaseRequest,
    @getUserMess() user: TCurrentUser,
  ) {
    return this.pageReleaseService.release(body, user);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMyPage(@getUserMess() user: TCurrentUser) {
    return this.pageReleaseService.getMyReleaseData(user);
  }

  @Put(':id/config')
  @UseGuards(AuthGuard('jwt'))
  updatePageConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReleaseConfigRequest,
    @getUserMess() user: TCurrentUser,
  ) {
    return this.pageReleaseService.updateReleaseConfig(id, body, user);
  }

  @Get('public')
  getPublicPages() {
    return this.pageReleaseService.getPublicPageList();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  getPage(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() user?: TCurrentUser,
  ) {
    return this.pageReleaseService.getReleaseData(id, user);
  }

  @Get(':id/versions')
  @UseGuards(AuthGuard('jwt'))
  getPageVersions(
    @Param('id', ParseIntPipe) id: number,
    @getUserMess() user: TCurrentUser,
  ) {
    return this.pageReleaseService.getPageVersions(id, user);
  }

  @Get(':id/versions/:versionId')
  @UseGuards(AuthGuard('jwt'))
  getPageVersionDetail(
    @Param('id', ParseIntPipe) id: number,
    @Param('versionId') versionId: string,
    @getUserMess() user: TCurrentUser,
  ) {
    return this.pageReleaseService.getPageVersionDetail(id, versionId, user);
  }
  @Get(':id/submissions/me')
  isMySubmissionPosted(
    @Param('id', ParseIntPipe) pageId: number,
    @GetUserIP() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const key = this.resolveSubmissionKey(ip, agent);
    return this.pageAnalyticsService.isQuestionDataPosted(key, pageId);
  }

  @Post(':id/submissions')
  postSubmission(
    @Param('id', ParseIntPipe) pageId: number,
    @Body() body: Pick<PostQuestionDataRequest, 'props'>,
    @GetUserIP() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const key = this.resolveSubmissionKey(ip, agent);
    return this.pageAnalyticsService.postQuestionData(
      { page_id: pageId, ...body },
      key,
    );
  }

  @Get('me/analytics/components')
  @UseGuards(AuthGuard('jwt'))
  getAnalyticsComponents(@getUserMess() user: TCurrentUser) {
    return this.pageAnalyticsService.getQuestionComponents(user);
  }

  @Get('me/analytics/submissions')
  @UseGuards(AuthGuard('jwt'))
  getAnalyticsSubmissions(@getUserMess() user: TCurrentUser) {
    return this.pageAnalyticsService.getQuestionData(user.id);
  }

  @Get('me/analytics/components/:componentId/submissions')
  @UseGuards(AuthGuard('jwt'))
  getAnalyticsSubmissionsByComponent(
    @getUserMess() user: TCurrentUser,
    @Param('componentId', ParseIntPipe) componentId: number,
  ) {
    return this.pageAnalyticsService.getQuestionDataByIdRequest({
      id: componentId,
      userId: user.id,
    });
  }

  private resolveSubmissionKey(ip: string, agent: string) {
    return this.secretTool.getSecret(ip + agent);
  }
}
