export const mockUsersService = () => ({
    create: jest.fn(),
    findUserById: jest.fn(),
    findUserByAuth0Id$: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    addAvatar: jest.fn(),
    deleteAvatarByUserId: jest.fn(),
    getAvatar: jest.fn(),
    emailExists: jest.fn(),
});
