import {IsString} from 'class-validator';

export class CreateRoomDto {

    @IsString({ message: 'The question must be a strings'})
    question: string;

    @IsString({each: true, message: 'The options for a question must be strings'})
    options: string[];
}
