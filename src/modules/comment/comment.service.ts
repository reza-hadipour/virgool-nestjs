import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { CommentEntity } from './entity/comment.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/comment.dto';
import { BlogService } from '../blog/blog.service';
import { EntityName } from 'src/common/enums/entity.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationGenerate, PaginationResolver } from 'src/common/utils/pagination.util';

@Injectable({scope: Scope.REQUEST})
export class CommentService {
    constructor(
        @Inject(REQUEST) private req: Request,
        @InjectRepository(CommentEntity) private commentRepository: Repository<CommentEntity>,
        @Inject(forwardRef(()=> BlogService)) private blogService: BlogService,
        
    ){}

    async create(commentDto: CreateCommentDto){
        const {id: userId} = this.req.user
        const {text,blogId,parentId} = commentDto;

        const blog = await this.blogService.checkExistsBlogById(blogId);
        if(!blog) throw new NotFoundException("Blog not found.")

        let parent: CommentEntity | null = null;

        if(parentId){
            parent = await this.checkExistsCommentById(+parentId)
            if(!parent) throw new BadRequestException("Parent is not exists.")
        }


        // Create comment
        this.commentRepository.insert({
            text,
            blogId,
            accepted: true,
            userId,
            parentId: parent? parentId: undefined
        })
        return {
            message: "Comment inserted."
        }
    }

    async getBlogComments(blogId: number, pagination: PaginationDto){

        const {limit,page,skip} = PaginationResolver(pagination)

        let [comments, count] = await this.commentRepository.findAndCount({
            where: {
                blogId,
                accepted: true,
                parentId: IsNull()
            },
            relations:{
                user: {
                    profile: true
                },
                children: {
                    user: {
                        profile: true
                    },
                    children: {
                        user: {
                            profile: true
                        }
                    }
                }
            },
            select: {
                id: true,
                text: true,
                user: {
                    username: true,
                    profile: {
                        nick_name: true
                    }
                },
                children : {
                    id: true,
                    text: true,
                    user: {
                        username: true,
                        profile : {
                            nick_name: true
                        }
                    },
                    children: {
                        id: true,
                        text: true,
                        user: {
                            username: true,
                            profile: {
                                nick_name: true
                            }
                        }
                    }
                }
            },
            order: {
                id: 'DESC'
            },
            take: limit,
            skip,
        })

        return {
            pagination : PaginationGenerate(page,limit,count),
            comments
        }

        // let blogs = await this.commentRepository.createQueryBuilder("c")
        // .where("c.blogId = :blogId AND c.parentId IS NULL",{blogId})
        // .leftJoin("c.children","children")
        // .leftJoin("children.children","sub_children")
        // .select(["c.text","children.text", "sub_children.text"])
        // .orderBy("c.created_at",'ASC')
        // .getMany();

        // return blogs;
    }

    async accept(id: number){
        let comment = await this.checkExistsCommentById(id);
        if(!comment) throw new NotFoundException("Comment not found.")
        
        if(comment.accepted) throw new BadRequestException("Comment is accepted already.")
        
        comment.accepted = true;
        await this.commentRepository.save(comment);

        return {
            message: "Comment Accepted"
        }
    }

    async reject(id: number){
        let comment = await this.checkExistsCommentById(id);
        if(!comment) throw new NotFoundException("Comment not found.")
        
        if(!comment.accepted) throw new BadRequestException("Comment is rejected already.")
        
        comment.accepted = false;
        await this.commentRepository.save(comment);

        return {
            message: "Comment Rejected"
        }
    }


    async checkExistsCommentById(id: number){
        return await this.commentRepository.findOneBy({id});
    }
}
