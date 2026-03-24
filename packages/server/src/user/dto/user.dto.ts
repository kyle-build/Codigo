import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'username必须是字符串' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'head_img必须是字符串' })
  head_img?: string;
}

export class UpdatePasswordDto {
  @IsOptional()
  @IsString({ message: 'oldPassword必须是字符串' })
  oldPassword?: string;

  @IsNotEmpty({ message: 'newPassword不能为空' })
  @IsString({ message: 'newPassword必须是字符串' })
  newPassword: string;
}
