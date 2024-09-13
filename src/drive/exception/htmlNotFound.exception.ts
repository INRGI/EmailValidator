import { NotFoundException } from "@nestjs/common";

export class HTMLNotFoundException extends NotFoundException{
    constructor(product: string){
        super(`HTML file for product: ${product} Not Found`);
    }
};