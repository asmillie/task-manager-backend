import { IsIn } from 'class-validator';

export class TaskSortOption {
    @IsIn(['completed', 'createdAt', 'updatedAt', 'description'])
    private _field: string;

    @IsIn([1, -1])
    private _direction: number;

    constructor(field: string, direction: string) {
        this._field = field;
        this._direction = (direction.toLowerCase() === 'desc') ? -1 : 1;
    }

    get field(): string {
        return this._field;
    }

    get direction(): number {
        return this._direction;
    }
}
