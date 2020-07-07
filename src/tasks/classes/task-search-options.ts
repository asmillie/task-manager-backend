import { IsOptional, IsBoolean, ValidateNested, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskQueryOptions } from './task-query-options';

export class TaskSearchOptions {
    @IsOptional()
    @IsBoolean()
    completed?: boolean;

    @IsOptional()
    @IsDate()
    startCreatedAt?: Date;

    @IsOptional()
    @IsDate()
    endCreatedAt?: Date;

    @IsOptional()
    @IsDate()
    startUpdatedAt?: Date;

    @IsOptional()
    @IsDate()
    endUpdatedAt?: Date;

    @IsOptional()
    @Type(() => TaskQueryOptions)
    @ValidateNested()
    tqo?: TaskQueryOptions;
}
