import { IsOptional, IsInt, IsPositive, ValidateNested, IsBoolean, IsDate, IsDateString } from 'class-validator';
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

    @IsOptional()
    @IsBoolean()
    readonly completed?: boolean;

    @IsOptional()
    @IsDateString()
    readonly startCreatedAt?: Date;

    @IsOptional()
    @IsDateString()
    readonly endCreatedAt?: Date;

    @IsOptional()
    @IsDateString()
    readonly startUpdatedAt?: Date;

    @IsOptional()
    @IsDateString()
    readonly endUpdatedAt?: Date;
}
