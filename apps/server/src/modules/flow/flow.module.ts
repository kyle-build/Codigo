import { Module } from '@nestjs/common';
import { CollaborationController } from 'src/modules/flow/controller/collaboration.controller';
import { LegacyLowCodeController } from 'src/modules/flow/controller/low-code.controller';
import { PagesController } from 'src/modules/flow/controller/pages.controller';
import { PageWorkspaceController } from 'src/modules/flow/controller/page-workspace.controller';
import { CollaborationGateway } from 'src/modules/flow/gateway/collaboration.gateway';
import {
  Component,
  ComponentData,
  Page,
} from 'src/modules/flow/entity/low-code.entity';
import { PageCollaborator } from 'src/modules/flow/entity/page-collaborator.entity';
import { OperationLog } from 'src/modules/flow/entity/operation-log.entity';
import { PageVersion } from 'src/modules/flow/entity/page-version.entity';
import { CollaborationService } from 'src/modules/flow/service/collaboration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageAnalyticsService } from 'src/modules/flow/service/page-analytics.service';
import { PageReleaseService } from 'src/modules/flow/service/page-release.service';
import { PageWorkspaceService } from 'src/modules/flow/service/page-workspace.service';
import { User } from 'src/modules/user/entity/user.entity';
import { SecretTool } from 'src/shared/utils/secret.tool';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Page,
      Component,
      ComponentData,
      PageCollaborator,
      OperationLog,
      PageVersion,
      User,
    ]),
  ],
  controllers: [
    LegacyLowCodeController,
    PagesController,
    PageWorkspaceController,
    CollaborationController,
  ],
  providers: [
    SecretTool,
    PageReleaseService,
    PageAnalyticsService,
    PageWorkspaceService,
    CollaborationService,
    CollaborationGateway,
  ],
})
export class FlowModule {}
