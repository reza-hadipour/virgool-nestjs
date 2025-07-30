import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ProfileDto } from './dto/profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { isDate } from 'class-validator';
import { ProfileImages } from './types/files.type';
import { ChangeEmailDto } from './dto/change-email.dto';
import { AuthService } from '../auth/auth.service';
import { OtpCauseEnum } from '../auth/enums/auth.enum';
import { TokenService } from '../auth/token.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginateCustomList } from 'src/common/utils/pagination.util';
import { UserStatus } from './enums/user_status.enum';

@Injectable({scope: Scope.REQUEST})
export class UserService {

  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
    @Inject(REQUEST) private req: Request,
    private authService: AuthService,
    private tokenService: TokenService,
){}

  async changeProfile(profileDto: ProfileDto, files: ProfileImages){
    let {id: userId, profileId} = this.req.user;


    if(files?.image_profile?.length > 0){
      let [image] = files.image_profile;
      profileDto.image_profile = image.path.slice(7)
    }
    
    if(files?.bg_image?.length > 0){
      let [image] = files.bg_image;
      profileDto.bg_image = image.path.slice(7)
    }
    
    const {bio,birthday,gender,linkedin_profile,nick_name,x_profile, bg_image, image_profile} = profileDto
    let profile = await this.profileRepository.findOneBy({userId});

    if(profile){
      //Update Profile
      if (bg_image) profile.bg_image = bg_image
      if (image_profile) profile.image_profile = image_profile
      if (nick_name) profile.nick_name = nick_name
      if (bio) profile.bio = bio
      if (gender) profile.gender = gender
      if (birthday && isDate(new Date(birthday))) profile.birthday = new Date(birthday)
      if (linkedin_profile) profile.linkedin_profile = linkedin_profile
      if (x_profile) profile.x_profile = x_profile
    }else{
      // Create new Profile
      profile = this.profileRepository.create({
        nick_name,
        bio,
        gender,
        birthday,
        linkedin_profile,
        x_profile,
        userId: userId
      })
    }

    profile = await this.profileRepository.save(profile);

    if(!profileId){
      await this.userRepository.update({id: userId},{profileId: profile?.id})
    }

    return profile;

  }

  async profile(){
    const {id} =  this.req.user;

    const userMetadata = await this.userRepository.metadata
    const userColumns = userMetadata.columns.map(col => `user.${col.propertyName}`)

    let user = await this.userRepository.createQueryBuilder("user")
    .leftJoinAndSelect("user.profile", "profile")
    .leftJoinAndSelect("user.followings", "followings")
    .leftJoinAndSelect("user.followers", "followers")
    .where( "user.id = :id",{id})
    .select([
      ...userColumns,
      'followings.username',
      'followers.username',
      'profile.nick_name'
    ]).getOne();
    
    return user;

  }

  async blockToggle(userId: number){
    const {id} = this.req.user;
    if(userId == id) throw new BadRequestException("You can not block yourself.")

    const user = await this.userRepository.findOneBy({id: userId});
    if(!user) throw new NotFoundException("User not found.")

    let message;
    
    if(user.status === UserStatus.Block){
      //Unblock
      message = `${user.username} UnBlocked`
      await this.userRepository.update({id: userId},{status: undefined});
    }else{
      // Block
      message = `${user.username} Blocked`
      await this.userRepository.update({id: userId},{status: UserStatus.Block});
    }

    return {message}

  }

  async followToggle(followingId: number){
    const {id: userId} = this.req.user;

    if(followingId == userId) throw new BadRequestException("you can't follow yourself.")
    
    let user = await this.userRepository.findOne({
      where: {
        id: userId
      },
      relations : {
        followings: true
      }
    });

    if(!user) throw new NotFoundException("User not found.")

    const followingUser = await this.checkExistsUserById(followingId);
    if(!followingUser) throw new NotFoundException("Following user not found.")
      
    let message;
    
    // return user?.followings
    
    if(user.followings.some( flw => flw.id == followingId)){
      //UnFollow
      user.followings = user.followings.filter( flw => flw.id != followingId);
      message= `You unfollow ${followingUser.username}`;
    }else{
      //follow
      user.followings.push(followingUser);
      message= `You follow ${followingUser.username}`;
    }

    await this.userRepository.save(user);

    return {
      message
    }

  }

  async getFollowers(paginationDto: PaginationDto){
    const {id} = this.req.user;

    const user = await this.userRepository.createQueryBuilder('user')
    .where("user.id = :id",{id})
    .leftJoinAndSelect("user.followers","followers")
    .select([
      "user.id",
      "followers.id",
      "followers.username"
    ])
    .getOne();

    const userFollowers = user?.followers ?? [];
    const {list: followers, pagination} = PaginateCustomList(userFollowers, paginationDto)

    return {
      pagination,
      followers
    }
  }

  async getFollowings(paginationDto: PaginationDto){
    const {id} = this.req.user;

    const user = await this.userRepository.createQueryBuilder('user')
    .where("user.id = :id",{id})
    .leftJoinAndSelect("user.followings","followings")
    .select([
      "user.id",
      "followings.id",
      "followings.username"
    ])
    .getOne();

    const userFollowings = user?.followings ?? [];
    const {list: followings, pagination} = PaginateCustomList(userFollowings, paginationDto);

    return {
      pagination,
      followings
    }

  }

  async askChangeEmail(changeEmailDto: ChangeEmailDto){
    // Check duplicate email
    const {email} = changeEmailDto;
    const {id: userId} = this.req.user;

    await this.checkExistsEmail(userId,email);

    // Update or create OTP with method: emailChange
    let otp = await this.authService.CreateOtpForUser(userId, OtpCauseEnum.ChangeEmail, email);
        // await this.userRepository.update(userId,{otpId: otp?.id});
        
    const token = this.tokenService.GenerateOtpToken({userId, method: OtpCauseEnum.ChangeEmail, value: email})

    // Set token into cookie
    return {
        message: `Otp Code send to new user email`,
        token,
        code: otp?.code
    };

  }

  async verifyNewEmail(code: number){
    
  }

  async checkExistsEmail(userId: number, email: string): Promise<void> {
    let duplicateEmail = await this.userRepository.find({
      where: 
        {id: Not(userId), email: email}
    });

    if(duplicateEmail.length > 0) throw new ConflictException("This email is already used.")
  }

  async checkExistsUserById(userId: number){
    return await this.userRepository.findOneBy({id: userId});
  }
}
