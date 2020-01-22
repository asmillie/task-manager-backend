import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty({ message: 'Owner is required' })
    readonly owner: string;

    @IsNotEmpty({ message: 'Description is required' })
    readonly description: string;

    @IsOptional()
    readonly completed?: boolean;
}
