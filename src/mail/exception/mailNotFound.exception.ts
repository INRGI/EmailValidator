import { NotFoundException } from "@nestjs/common";

export class MailNotFoundException extends NotFoundException{
    constructor(fromName: string, subject: string){
        super(`Mail with From Name: ${fromName} and Subject : ${subject}  Not Found`);
    }
};