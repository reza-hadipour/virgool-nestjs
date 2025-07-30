import { BaseEntity } from "src/common/abstracts/BaseEntity.abstract";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, UpdateDateColumn } from "typeorm";
import { BlogStatus } from "../enum/blog_status.enum";
// import { LikeEntity } from "./like.entity";
// import { BookmarkEntity } from "./bookmark.entity";
import { CommentEntity } from "../../comment/entity/comment.entity";
import { CategoryEntity } from "src/modules/category/entities/category.entity";

@Entity(EntityName.Blog)
export class BlogEntity extends BaseEntity{
    @Column()
    title: string
    @Column({unique: true})
    slug: string
    @Column({nullable: true})
    time_to_study: string
    @Column()
    description: string
    @Column()
    content: string
    @Column({nullable: true})
    image: string
    @Column({default: BlogStatus.Draft})
    status: string
    @Column()
    authorId: number
    @ManyToOne(()=>UserEntity, (author)=>author.blogs, {onDelete: "CASCADE"})
    author: UserEntity
    // @OneToMany(()=> LikeEntity, like => like.blog)
    // likes: LikeEntity[]
    // @OneToMany(()=> BookmarkEntity, bookmark => bookmark.blog)
    // bookmarks: BookmarkEntity[]

    @OneToMany(()=> CommentEntity, comment => comment.blog)
    comments: CommentEntity[]

    @ManyToMany(()=> CategoryEntity, category => category.blogs, {
        cascade:['insert', 'update'],
        eager: false
    })
    @JoinTable({
        name: "blog_categories",
        joinColumn: {
            name: "blog_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn:{
            name: "category_id",
            referencedColumnName: "id"
        }
    })
    categories: CategoryEntity[]

    @ManyToMany(()=> UserEntity, user => user.bookmarks, {
        cascade:['insert', 'update'],
        eager: false
    })
    @JoinTable({
        name: "blog_bookmark",
        joinColumn: {
            name: "blog_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn:{
            name: "user_id",
            referencedColumnName: "id"
        }
    })
    bookmarked: UserEntity[]

    @ManyToMany(()=> UserEntity, user => user.likes, {
        cascade:['insert', 'update'],
        eager: false
    })
    @JoinTable({
        name: "blog_like",
        joinColumn: {
            name: "blog_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn:{
            name: "user_id",
            referencedColumnName: "id"
        }
    })
    likes: UserEntity[]

    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    updated_at: Date
}