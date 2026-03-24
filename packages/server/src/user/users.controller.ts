import { Body, Controller, Post, Patch, Put, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { getUserMess } from '../utils/GetUserMessageTool';
import type { TCurrentUser } from '../utils/GetUserMessageTool';
import { UpdateProfileDto, UpdatePasswordDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  register(@Body() body: RegisterDto) {
    const { phone, sendCode, password, confirm } = body;
    return this.userService.register(phone, sendCode, password, confirm);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(@Body() body: UpdateProfileDto, @getUserMess() user: TCurrentUser) {
    return this.userService.updateProfile(user.id, body);
  }

  @Put('me/password')
  @UseGuards(AuthGuard('jwt'))
  updatePassword(@Body() body: UpdatePasswordDto, @getUserMess() user: TCurrentUser) {
    return this.userService.updatePassword(user.id, body.oldPassword, body.newPassword);
  }
}
