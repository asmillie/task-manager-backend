import { Document } from 'mongoose';

export interface Task extends Document {
    readonly owner: string;
    readonly description: string;
    readonly completed: boolean;
}
