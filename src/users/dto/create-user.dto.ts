export class CreateUserDto {
    readonly name: string;
    readonly password: string;
    readonly email: string;
    readonly age: number;
    readonly avatar: Buffer;
    readonly tokens: [{
        readonly token: string;
    }];
}
