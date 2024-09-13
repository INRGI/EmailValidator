import { NotFoundException } from "@nestjs/common";

export class ProductFolderdException extends NotFoundException{
    constructor(productFolder: string){
        super(`Product folder: ${productFolder} Not Found`);
    }
};