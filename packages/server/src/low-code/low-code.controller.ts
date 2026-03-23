import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { LowCodeService } from './low-code.service';
import type {
  PostReleaseRequest,
  PostQuestionDataRequest,
} from '@codigo/schema';
import {
  GetUserAgent,
  GetUserIP,
  getUserMess,
} from '../utils/GetUserMessageTool';
import type { TCurrentUser } from '../utils/GetUserMessageTool';
import { AuthGuard } from '@nestjs/passport';
import { SecretTool } from '../utils/SecretTool';

@Controller('low_code')
export class LowCodeController {
  constructor(
    private readonly secretTool: SecretTool,
    private readonly lowCodeService: LowCodeService,
  ) {}

  /**
   * 低代码发布控制器
   */
  @Post('release')
  @UseGuards(AuthGuard('jwt'))
  release(@Body() body: PostReleaseRequest, @getUserMess() user: TCurrentUser) {
    return this.lowCodeService.release(body, user);
  }

  /**
   * 页面组件获取控制器
   */
  @Get('release_with_user')
  @UseGuards(AuthGuard('jwt'))
  getReleaseDataWithUser(@getUserMess() user: TCurrentUser) {
    console.log('获取发布页面数据，当前用户：', user);
    return this.lowCodeService.getReleaseData(null, user);
  }

  /**
   * 发布页面数据获取控制器
   */
  @Get('release')
  getReleaseData(@Query() query: { id: number }) {
    return this.lowCodeService.getReleaseData(query.id);
  }

  /**
   * 发布页面是否提交过问卷控制器
   */
  @Get('is_question_data_posted')
  isQuestionDataPosted(
    @Query() query: { page_id: number },
    @GetUserIP() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const key = this.secretTool.getSecret(ip + agent);
    return this.lowCodeService.isQuestionDataPosted(key, query.page_id);
  }

  /**
   * 发布页面问卷提交发布控制器
   */
  @Post('question_data')
  postQuestionData(
    @Body() body: PostQuestionDataRequest,
    @GetUserIP() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const key = this.secretTool.getSecret(ip + agent);
    return this.lowCodeService.postQuestionData(body, key);
  }

  /**
   * 后台统计组件获取控制器
   */
  @Get('question_components')
  @UseGuards(AuthGuard('jwt'))
  getQuestionComponents(@getUserMess() user: TCurrentUser) {
    return this.lowCodeService.getQuestionComponents(user);
  }

  /**
   * 后台统计问卷统计信息数据控制器
   */
  @Get('question_data')
  @UseGuards(AuthGuard('jwt'))
  getQuestionData(@getUserMess() user: TCurrentUser) {
    return this.lowCodeService.getQuestionData(user.id);
  }

  /**
   * 后台统计组件通过ID获取问卷数据控制器
   */
  @Post('get_question_data_by_id')
  @UseGuards(AuthGuard('jwt'))
  getQuestionDataByTypeRequest(
    @getUserMess() user: TCurrentUser,
    @Body() body: { id: number },
  ) {
    return this.lowCodeService.getQuestionDataByIdRequest({
      ...body,
      userId: user.id,
    });
  }
}
