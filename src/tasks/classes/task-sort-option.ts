import { IsIn } from 'class-validator';

export class TaskSortOption {
    @IsIn(['completed', 'createdAt', 'updatedAt', 'description'])
    public field: string;

    @IsIn(['asc', 'desc'])
    public direction: string;
}
