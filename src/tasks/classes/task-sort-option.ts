import { IsIn } from 'class-validator';

export class TaskSortOption {
    @IsIn(['completed', 'createdAt', 'updatedAt', 'description'])
    public field: string;

    @IsIn([1, -1])
    public direction: number;
}
