import { NotFoundException } from "@nestjs/common";

export class LiftFolderdException extends NotFoundException{
    constructor(liftFolder: string){
        super(`Lift folder: ${liftFolder} Not Found`);
    }
};