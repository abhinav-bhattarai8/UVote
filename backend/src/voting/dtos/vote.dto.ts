import {IsNumber} from 'class-validator'
export class VoteDto {

    @IsNumber({}, {message: 'The vote option must be a number'})
    voteOption: number
}