export const mockUser: any = {
    _id : '3e286b8940b3a61cacd8557d',
    name : 'Joe',
    email : {
        address: 'joe@email.co.uk',
    },
    tokens: [
        { token: 'valid-jwt' },
    ],
    toJSON: jest.fn().mockReturnValue('User JSON'),
};
