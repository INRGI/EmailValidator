import { BadRequestException } from "@nestjs/common";

export class MailErrorException extends BadRequestException{
    constructor(error: string){
        super(error);
    }
};