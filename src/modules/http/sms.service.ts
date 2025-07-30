import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { AxiosError } from "axios";
import { catchError, firstValueFrom , lastValueFrom} from "rxjs";
import { SendSmsDto } from "./dto/sms.dto";

@Injectable()
export class SmsService{
    constructor(private httpService: HttpService){}

    async sendSmsVerification(smsDto: SendSmsDto){
        const result = await lastValueFrom(this.httpService.post(
            process.env.SMS_URL,
            {
                "mobile": smsDto.mobile,
                "templateId": 910862,
                "parameters": [{
                    "name": "code",
                    "value": smsDto.code
                }]
            },{
                headers:{
                    "X-API-KEY": process.env.SMS_API_KEY,
                }
            }
        ).pipe(
            catchError((error: AxiosError) => {
                // console.log(error);
                throw new InternalServerErrorException(error.toJSON(),{cause: "SMS-service"});
            }),
        ))

        // console.log(result.data);
        return result.data;
    }

}