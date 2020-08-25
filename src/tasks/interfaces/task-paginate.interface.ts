import { Task } from './task.interface';

export interface TaskPaginationData {
    readonly totalResults: number;
    readonly totalPages: number;
    readonly currentPage: number;
    readonly pageSize: number;
    readonly tasks: Task[];
}
