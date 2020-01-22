import { IsNotEmpty, MinLength, IsEmail, IsLowercase } from 'class-validator';
import { Token } from '../interfaces/token.interface';

export class UserDto {
    @IsNotEmpty({ message: 'User name is required' })
    readonly name: string;

    @IsNotEmpty({ message: 'Password is required '})
    @MinLength(7, { message: 'Password must be at least 7 characters' })
    readonly password: string;

    @IsLowercase()
    @IsEmail({}, { message: 'Must be a valid email address' })
    readonly email: string;

    readonly avatar: Buffer;
    readonly tokens: Token[];
}
