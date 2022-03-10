import { IsOptional, IsInt, IsPositive, ValidateNested, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { TaskSortOption } from './task-sort-option';
import { Type } from 'class-transformer';

export class TaskQueryOptions {
    @IsInt()
    @IsPositive()
    @Max(100)
    readonly limit: number;

    @IsInt()
    @Min(1)
    readonly page: number;

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
