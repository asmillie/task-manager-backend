export interface Token {
    readonly _id?: string;
    readonly token: string;
    readonly expiry: Date;
}
