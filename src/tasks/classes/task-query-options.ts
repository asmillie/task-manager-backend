import { IsOptional, IsInt, IsPositive, ValidateNested } from 'class-validator';
import { TaskSortOption } from './task-sort-option';
import { Type } from 'class-transformer';

export class TaskQueryOptions {
    @IsOptional()
    @IsInt()
    @IsPositive()
    readonly limit?: number;

    @IsOptional()
    @IsInt()
    readonly skip?: number;

    @IsOptional()
    @Type(() => TaskSortOption)
    @ValidateNested()
    readonly sort?: TaskSortOption[];
}
