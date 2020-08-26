export const mockTaskModel = () => ({
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    sort: jest.fn().mockReturnThis(),
});