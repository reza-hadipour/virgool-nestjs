import { FileInterceptor } from "@nestjs/platform-express"
import { multerDiskStorage, multerFilter, multerLimit } from "../utils/multer.util"

export function UploadFile(fieldName: string, directoryName: string, fileSize: number){
    return class UploadUtility extends FileInterceptor(fieldName,{
        storage: multerDiskStorage(directoryName),
        fileFilter: multerFilter,
        limits: multerLimit(fileSize,1)
    }){}
}