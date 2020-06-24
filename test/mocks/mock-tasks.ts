import { mockUser } from './mock-user';

const mockTask1: any = {
    _id: 'task-id',
    owner: mockUser._id,
    description: 'Incomplete Task #1',
    completed: false,
    createdAt: '2020-06-24T13:19:26.146Z',
};

const mockTask2: any = {
    _id: 'task-id',
    owner: mockUser._id,
    description: 'Incomplete Task #2',
    completed: false,
    createdAt: '2020-06-24T13:19:26.146Z',
};

const mockTask3: any = {
    _id: 'task-id',
    owner: mockUser._id,
    description: 'Incomplete Task #3',
    completed: false,
    createdAt: '2020-06-24T13:19:26.146Z',
};

const mockTask4: any = {
    _id: 'task-id',
    owner: mockUser._id,
    description: 'Completed Task #1',
    completed: true,
    createdAt: '2020-01-04T02:19:26.146Z',
};

const mockTask5: any = {
    _id: 'task-id',
    owner: mockUser._id,
    description: 'Completed Task #2',
    completed: true,
    createdAt: '2019-02-24T10:00:26.146Z',
};

const mockTask6: any = {
    _id: 'task-id',
    owner: mockUser._id,
    description: 'Completed Task #3',
    completed: true,
    createdAt: '2019-01-01T12:39:26.146Z',
};

export const mockTasks = [mockTask1, mockTask2, mockTask3, mockTask4, mockTask5, mockTask6];
