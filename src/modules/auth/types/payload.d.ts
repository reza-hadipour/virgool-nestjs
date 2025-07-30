import { AuthMethodEnum, OtpCauseEnum } from "../enums/auth.enum"

export type CookiePayload = {
    userId: number | undefined,
    method: OtpCauseEnum | AuthMethodEnum,
    value: string
}

export type AccessTokenPayload = {
    userId: number | undefined
}