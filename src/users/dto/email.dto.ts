import { IsLowercase, IsEmail } from 'class-validator';

export class EmailDto {
    @IsLowercase()
    @IsEmail({}, { message: 'Must be a valid email address' })
    readonly address: string;
}
