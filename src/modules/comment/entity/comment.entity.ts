import { BaseEntity } from "src/common/abstracts/BaseEntity.abstract";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BlogEntity } from "../../blog/entity/blog.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.Comment)
export class CommentEntity extends BaseEntity{
    @Column()
    text: string
    @Column({default: false})
    accepted: boolean
    @Column()
    blogId: number
    @Column()
    userId: number
    @Column({nullable: true})
    parentId: number


    @ManyToOne(()=> BlogEntity, blog => blog.comments, {onDelete: "CASCADE"})
    blog: BlogEntity

    @ManyToOne(()=> UserEntity, user => user.comments, {onDelete: "CASCADE"})
    user: UserEntity

    @ManyToOne(()=> CommentEntity, comment => comment.children, {onDelete: "CASCADE"})
    parent: CommentEntity

    @OneToMany(()=> CommentEntity, comment => comment.parent)
    @JoinColumn({name: "parentId"})
    children: CommentEntity[]


    @CreateDateColumn()
    created_at: Date
}