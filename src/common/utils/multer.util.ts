import { Request } from "express";
import { existsSync, mkdirSync } from "fs";
import { extname, join } from "path";
import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";

export type callbackDestination = (err: Error | null, dest: string) => void
export type callbackFilename = (err: Error | null, filename: string) => void
export type callbackFilter = (error: Error | null, acceptFile: boolean) => void
export type MulterType = Express.Multer.File;

export function multerDestination(directoryName: string) {
    return (req: Request, file: MulterType, callback: callbackDestination): void => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth()+1;
    const day = currentDate.getDate();

    const path = join("public","uploads",`${directoryName}`,year.toString(),month.toString(), day.toString());
    if(!existsSync(path)){
        mkdirSync(path,{recursive: true});
    }

    callback(null,path);
}
}

export function multerFilename(req: Request, file: MulterType, callback: callbackFilename): void {
    const ext = extname(file.originalname);
    const fieldname = file.fieldname
    const filename = `${fieldname}-${Date.now()}${ext}`;

    callback(null,filename);
}

export function multerFilter(req: Request, file: MulterType, callback: callbackFilter ){
    const allowedFormats = ["image/jpeg","image/png","image/webp"]
    if(allowedFormats.includes(file.mimetype.toLocaleLowerCase()))
        callback(null, true)
    else
        callback(new BadRequestException("Image format is not supported"), false)
}

export function multerDiskStorage(directoryName: string = "images"){
    return diskStorage({
          destination: multerDestination(directoryName),
          filename: multerFilename
        })
}

export function multerLimit(fileSize: number = 1, files:number = 1){
    return {
        files,
        fileSize: 1024*1024*fileSize
    }
}