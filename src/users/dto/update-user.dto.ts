import { IsEmail } from 'class-validator';

export class UpdateUserDto {
    @IsEmail({}, { message: 'Must be a valid email address' })
    readonly email?: string;
}
