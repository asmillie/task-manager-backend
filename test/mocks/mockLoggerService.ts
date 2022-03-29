export const mockLoggerService = () => ({
    getLogger: () => ({
        info: jest.fn(),
        error: jest.fn()
    }),
    logDbOperationStart: () => jest.fn().mockResolvedValue('1'),
    logDbOperationEnd: () => jest.fn(),
});