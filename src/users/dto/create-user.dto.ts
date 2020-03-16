import { IsNotEmpty, MinLength, IsEmail, IsLowercase, ValidateNested } from 'class-validator';
import { Token } from '../interfaces/token.interface';
import { EmailDto } from './email.dto';

export class CreateUserDto {
    @IsNotEmpty({ message: 'User name is required' })
    readonly name: string;

    @IsNotEmpty({ message: 'Password is required '})
    @MinLength(7, { message: 'Password must be at least 7 characters' })
    readonly password: string;

    @ValidateNested()
    readonly email: EmailDto;

    readonly avatar?: Buffer;
    readonly tokens?: Token[];
}
