import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTaskDto {
    @IsOptional()
    @IsNotEmpty({ message: 'Owner is required' })
    readonly owner?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Description is required' })
    readonly description?: string;

    @IsOptional()
    readonly completed?: boolean;
}
