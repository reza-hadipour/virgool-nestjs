import { BadGatewayException, BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { checkOtpDto, GoogleUserDto, LoginDto, SendSmsDto } from './dto/auth.dto';
import { AuthMethodEnum, AuthTypeEnum, OtpCauseEnum } from './enums/auth.enum';
import { isEmail, isMobilePhone } from 'class-validator';
import { UserEntity } from '../user/entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity } from '../user/entities/profile.entity';
import { OtpEntity } from '../user/entities/otp.entity';
import { randomInt } from 'crypto';
import { TokenService } from './token.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { SmsService } from '../http/sms.service';
import { EnvEnum } from 'src/common/enums/application.enums';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
        @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
        private tokenService: TokenService,
        @Inject(REQUEST) private request: Request,
        private smsService: SmsService
    ) { }

    async userExistence(loginDto: LoginDto) {
        const { method, type, username } = loginDto;

        switch (type) {
            case AuthTypeEnum.Login:
                return this.login(method, username);
            case AuthTypeEnum.Register:
                return this.register(method, username);
        }
    }

    private async sendSms(smsDto: SendSmsDto) {
        const { code, mobile } = smsDto;

        let smsResult;
        let message = "OTP send to user";

        try {
            smsResult = await this.smsService.sendSmsVerification({
                code: code,
                mobile: mobile
            })
        } catch (error) {
            console.log(error);
            message = `${error?.cause}: ${error?.message}. code: ${error?.response.code}`
        }

        if (!!smsResult?.status) {
            return !!smsResult?.status
        } else {
            throw new InternalServerErrorException(message);
        }
    }

    async login(method: AuthMethodEnum, username: string) {
        this.usernameValidation(method, username);
        let user: UserEntity | null;
        user = await this.checkExistUser(method, username);
        if (!user) throw new BadRequestException("User not found.")
        let otp: OtpEntity | null;

        otp = await this.CreateOtpForUser(user.id, method, username);
        await this.userRepository.update(user.id, { otpId: otp?.id });

        const token = this.tokenService.GenerateOtpToken({ userId: user.id, method: method, value: username })

        const message = `Otp Code send to user successfully`;

        if (method === AuthMethodEnum.Phone) {
            // Send SMS
            const smsResult = await this.sendSms({
                code: otp.code,
                mobile: user.phone
                // mobile: "093844839744"
            }).catch(async (err) => {
                otp.expiresIn = new Date();
                await this.otpRepository.save(otp);
                throw new InternalServerErrorException(err.message);
            })

            return {
                smsResult,
                token,
                code: otp.code,
                message,
                [method]: username
            }

        } else {
            // Email
            return {
                token,
                code: otp.code,
                message,
                [method]: username
            }
        }
    }

    async register(method: AuthMethodEnum, username: string) {
        let user: UserEntity | null;
        let otp: OtpEntity | null = null;

        if (method === AuthMethodEnum.Username) {
            throw new BadRequestException("you can not register with username");
        }
        this.usernameValidation(method, username);

        user = await this.checkExistUser(method, username.toLowerCase());
        if (user) throw new ConflictException(`This ${method} is already registered.`)

        let newUserDto = {
            [method]: username,
        }

        try {
            this.userRepository.createQueryBuilder("x").useTransaction(true);
            user = this.userRepository.create(newUserDto);
            user = await this.userRepository.save(user);

            // Generate random username
            user.username = `m_${user.id}`;

            otp = await this.CreateOtpForUser(user.id, method, username);
            user.otpId = otp?.id;
            user = await this.userRepository.save(user);
            otp = await this.otpRepository.save(otp);

            if (!otp) throw new InternalServerErrorException("OTP generation failed");

            const token = this.tokenService.GenerateOtpToken({ userId: user?.id, method, value: username })

            // Send OTP
            const message = `Otp Code send to user successfully`;

            if (method === AuthMethodEnum.Phone) {
                // Send SMS
                const smsResult = await this.sendSms({
                    code: otp?.code,
                    mobile: user?.phone
                }).catch(async (err) => {
                    await this.otpRepository.update(
                        { id: otp?.id },
                        { expiresIn: new Date() }
                    );
                    throw new InternalServerErrorException(err.message);
                })

                return {
                    smsResult,
                    token,
                    code: otp.code,
                    message,
                    [method]: username
                }

            } else {
                // Email
                return {
                    token,
                    code: otp.code,
                    message,
                    [method]: username
                }
            }

        } catch (error) {
            await this.userRepository.queryRunner?.rollbackTransaction();
            if (error) throw new BadGatewayException(`${error.code}: ${error.message}`)
        } finally {
            await this.userRepository.queryRunner?.release();
        }

    }

    async googleLogin(googleUserDto: GoogleUserDto) {
        const { email, nick_name } = googleUserDto;
        let user = await this.userRepository.findOneBy({ email });
        let token;
        let message;

        if (user) {
            // Login
            token = this.tokenService.GenerateAccessToken({ userId: user.id });
            message = "User login successfully";
            
        } else {
            // Register new User
            
            let newUserDto = {
                email,
            }
            
            user = this.userRepository.create(newUserDto);
                user = await this.userRepository.save(user);

                // Generate random username
                // user.username = `m_${user.id}`;
                user.username = `m_${user.id}`;
                user.emailVerified = true;
                
                let profile = this.profileRepository.create({nick_name, userId: user.id});
                profile = await this.profileRepository.save(profile);
                
                user.profileId = profile.id;
                user = await this.userRepository.save(user);
                
                token = this.tokenService.GenerateAccessToken({userId: user.id})
                message = "User Registered successfully";
        }

        return {
            message,
            token
        };
    }

    async checkOtp(otpDto: checkOtpDto) {
        const token = await this.request?.cookies[CookieKeys.Otp];
        if (!token) throw new BadRequestException("Invalid request,there is no token for operation. try again.")
        const { userId, method, value } = this.tokenService.VerifyOtpToken(token);
        const { code } = otpDto;

        let user = await this.userRepository.findOne({
            where: {
                id: userId
            },
            relations: {
                otp: true
            }
        })

        if (!user) throw new NotFoundException("User not found.")

        if (!user?.otp) throw new UnauthorizedException("There is no otp.login again.")

        if (user?.otp.expiresIn < new Date()) {
            throw new UnauthorizedException("Your otp is expired.")
        }

        if (user.otp.code !== code) {
            throw new UnauthorizedException("Your code is incorrect.")
        }

        if (user.otp.method !== method) {
            throw new UnauthorizedException(`This OTP is not for ${method} method.`)
        }

        switch (method) {
            case AuthMethodEnum.Email:
                user.emailVerified = true
                break;
            case AuthMethodEnum.Phone:
                user.phoneVerified = true
                break;
            case OtpCauseEnum.ChangeEmail:
                user.email = value
                user.emailVerified = true
                break;
        }

        user = await this.userRepository.save(user);

        const accessToken = this.tokenService.GenerateAccessToken({ userId });

        return {
            accessToken,
            user
        };
    }

    async getUserByAccessToken(token: string) {
        const { userId } = this.tokenService.VerifyAccessToken(token);
        const user = await this.userRepository.findOneBy({ "id": userId });

        if (!user) throw new UnauthorizedException("User not found, login again.");
        return user;
    }

    async CreateOtpForUser(userId: number, method: OtpCauseEnum | AuthMethodEnum, value: string) {
        let otp = await this.otpRepository.findOne({
            where: {
                userId
            }
        })

        const code = randomInt(10000, 99999).toString();
        const expiresIn = new Date(Date.now() + (1000 * 60 * 2))

        if (otp) {
            if (otp.expiresIn > new Date()) throw new BadRequestException("You have a valid OTP, try again 2 minutes later.")

            otp.code = code;
            otp.expiresIn = expiresIn;
            otp.method = method;
            otp = await this.otpRepository.save(otp);
        } else {
            otp = this.otpRepository.create({
                code,
                expiresIn,
                method,
                userId
            });
            otp = await this.otpRepository.save(otp);
        }
        return otp;
    }

    async checkExistUser(method: AuthMethodEnum, username: string) {
        let user: UserEntity | null;
        let where: FindOptionsWhere<UserEntity>;

        switch (method) {
            case AuthMethodEnum.Email:
                where = { 'email': username }
                break;
            case AuthMethodEnum.Phone:
                where = { 'phone': username }
                break;
            case AuthMethodEnum.Username:
                where = { 'username': username }
                break;
        }

        user = await this.userRepository.findOne({ where });
        return user;
    }

    usernameValidation(method: AuthMethodEnum, username: string) {
        switch (method) {
            case AuthMethodEnum.Email:
                if (isEmail(username)) return username;
                throw new BadRequestException("Email format is incorrect.")
            case AuthMethodEnum.Phone:
                if (isMobilePhone(username, "fa-IR")) return username;
                throw new BadRequestException("Mobile format is incorrect.")
            case AuthMethodEnum.Username:
                if (isMobilePhone(username, "fa-IR") || isEmail(username)) throw new BadRequestException("Username should not be like Phone or Email.")
                return username
        }
    }
}
