import { BaseEntity } from "src/common/abstracts/BaseEntity.abstract";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OtpEntity } from "./otp.entity";
import { ProfileEntity } from "./profile.entity";
import { BlogEntity } from "src/modules/blog/entity/blog.entity";
// import { LikeEntity } from "src/modules/blog/entity/like.entity";
// import { BookmarkEntity } from "src/modules/blog/entity/bookmark.entity";
import { CommentEntity } from "src/modules/comment/entity/comment.entity";
import { ImageEntity } from "src/modules/image/entities/image.entity";
import { RolesEnum } from "src/common/enums/roles.enum";

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
    @Column({unique: true, nullable: true})
    username: string
    @Column({nullable: true})
    password: string
    @Column({unique: true, nullable: true})
    phone: string
    @Column({unique: true, nullable: true})
    email: string
    @Column({nullable: true, default: null})
    status: string
    @Column({nullable: true})
    otpId: number
    @OneToOne(()=> OtpEntity, otp => otp.user, {nullable: true})
    @JoinColumn({name: "otpId"})
    otp: OtpEntity
    @Column({nullable: true})
    profileId: number
    @OneToOne(()=> ProfileEntity, profile => profile.user)
    @JoinColumn({name: "profileId"})
    profile: ProfileEntity
    @Column({default: false})
    phoneVerified: boolean
    @Column({default: false})
    emailVerified: boolean
    @OneToMany(()=> BlogEntity, blog => blog.author)
    blogs: BlogEntity[]
    @OneToMany(()=>ImageEntity, image => image.user)
    images: ImageEntity[]
    @Column({default: RolesEnum.USER})
    role: string

    @ManyToMany(()=> UserEntity, user => user.followers)
    followings: UserEntity[]
    @JoinTable({
        joinColumn:{
            name: "userId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "followingId",
            referencedColumnName: "id"
        }
    })

    @ManyToMany(()=> UserEntity, user => user.followings)
    followers: UserEntity[]

    // @OneToMany(()=>LikeEntity, like=> like.user)
    // blog_likes: LikeEntity[]
    // @OneToMany(()=>BookmarkEntity, bookmark=> bookmark.user)
    // blog_bookmarks: BookmarkEntity[]

    @OneToMany(()=>CommentEntity, comment=> comment.user)
    comments: CommentEntity[]

    @ManyToMany(()=> BlogEntity, blog => blog.bookmarked)
    bookmarks: BlogEntity[]

    @ManyToMany(() => BlogEntity, blog => blog.likes)
    likes: BlogEntity[]

    @CreateDateColumn()
    created_at: string
    @UpdateDateColumn()
    updated_at: string
}
