import { IsOptional, IsBoolean, IsInt, IsPositive } from 'class-validator';
import { TaskSortOption } from './task-sort-option';

export class TaskQueryOptions {
    @IsOptional()
    @IsInt()
    @IsPositive()
    readonly limit?: number;

    @IsOptional()
    @IsInt()
    readonly skip?: number;

    readonly sort?: TaskSortOption[];
}
