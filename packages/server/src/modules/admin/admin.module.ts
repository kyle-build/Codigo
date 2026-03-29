import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPermissionGuard } from 'src/core/guard/admin-permission.guard';
import { AdminController } from 'src/modules/admin/controller/admin.controller';
import { AdminService } from 'src/modules/admin/service/admin.service';
import {
  Component,
  ComponentData,
  Page,
} from 'src/modules/flow/entity/low-code.entity';
import { OperationLog } from 'src/modules/flow/entity/operation-log.entity';
import { PageCollaborator } from 'src/modules/flow/entity/page-collaborator.entity';
import { PageVersion } from 'src/modules/flow/entity/page-version.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { SecretTool } from 'src/shared/utils/secret.tool';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Page,
      Component,
      ComponentData,
      PageCollaborator,
      OperationLog,
      PageVersion,
    ]),
  ],
  controllers: [AdminController],
  providers: [SecretTool, AdminService, AdminPermissionGuard],
})
export class AdminModule {}
