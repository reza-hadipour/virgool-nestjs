import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entity/blog.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import slugify from 'slugify';
import { calculateReadTime } from 'read-time-calculator';
import { BlogImage } from './types/file';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationGenerate, PaginationResolver } from 'src/common/utils/pagination.util';
import { CategoryService } from '../category/category.service';
import { CategoryEntity } from '../category/entities/category.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { CommentService } from '../comment/comment.service';
import { profile } from 'console';
import { BlogStatus } from './enum/blog_status.enum';
// import { LikeEntity } from './entity/like.entity';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {

    constructor(
        @InjectRepository(BlogEntity) private blogRepository: Repository<BlogEntity>,
        // @InjectRepository(LikeEntity) private likeRepository: Repository<LikeEntity>,
        private categoryService: CategoryService,
        private commentService: CommentService,
        private dataSource: DataSource,
        @Inject(REQUEST) private req: Request
    ) { }

    async createBlog(blogDto: CreateBlogDto, file: BlogImage) {
        const { id: userId } = this.req.user;
        let { categories, content, description, image, slug, title } = blogDto;

        let categoryEntities: CategoryEntity[] = [];

        if (file?.image?.length > 0) {
            let [imageFile] = file.image;
            image = imageFile.path.slice(7);
        }

        if (!categories) {
            categories = [];
        } else if (typeof categories === "string") {
            categories = categories.split(",");
        }

        for (const categoryTitle of categories) {
            const title = categoryTitle.trim().toLocaleLowerCase();

            let category = await this.categoryService.findOneByTitle(title);

            if (!category) {
                category = await this.categoryService.insertByTitle(title);
            }

            categoryEntities.push(category);
        }


        slug = await this.createSlug(slug ?? title)

        const time_to_study = calculateReadTime(content).timeFormat;

        let newBlog = this.blogRepository.create({
            title,
            content,
            description,
            slug,
            image,
            time_to_study,
            categories: categoryEntities
        });

        newBlog.authorId = userId;
        newBlog = await this.blogRepository.save(newBlog);

        return newBlog;
    }

    async createSlug(rawSlug: string, existId: number | null = null) {
        let slug = slugify(rawSlug.toLowerCase(), { lower: true, locale: "fa" });

        const blog = await this.checkExistsBlogBySlug(slug);

        const randomString = Math.random().toString(36).substring(2);

        if (blog) {
            if (existId) {
                if (blog.id != existId) {
                    slug += `-${randomString}`;
                }
            } else {
                slug += `-${randomString}`;
            }
        }

        return slug;
    }

    async likeToggle(blogId: number) {
        const user = this.req.user;

        let likedBlog = await this.blogRepository.findOne({
            where: {
                id: blogId
            },
            relations: {
                likes: true
            },
            select: {
                likes: {
                    id: true
                }
            }
        })

        if (!likedBlog) throw new NotFoundException("Blog not found.")

        const isLiked = likedBlog.likes.some(u => u.id === user.id);

        let message;

        if (isLiked) {
            // Dislike
            likedBlog.likes = likedBlog.likes.filter(u => u.id !== user.id)
            message = "Blog DisLiked";
        } else {
            // Like
            likedBlog.likes.push(user);
            message = "Blog Liked"
        }

        await this.blogRepository.save(likedBlog);

        return {
            message
        };
    }

    async bookmarkToggle(blogId: number) {
        const user = this.req.user;

        let bookmarkedBlog = await this.blogRepository.findOne({
            where: {
                id: blogId
            },
            relations: {
                bookmarked: true
            },
            select: {
                bookmarked: {
                    id: true
                }
            }
        })

        if (!bookmarkedBlog) throw new NotFoundException("Blog not found");

        let isBookmarked = bookmarkedBlog.bookmarked.some(u => u.id === user.id);

        let message;

        if (isBookmarked) {
            // Dislike
            bookmarkedBlog.bookmarked = bookmarkedBlog.bookmarked.filter(u => u.id !== user.id)
            message = "Blog DisBookmarked"
        } else {
            // Like
            bookmarkedBlog.bookmarked.push(user);
            message = "Blog Bookmarked"
        }

        await this.blogRepository.save(bookmarkedBlog)

        return {
            message
        }
    }

    async checkExistsBlogBySlug(slug: string) {
        const blog = await this.blogRepository.findOneBy({ slug });
        // if(blog){
        //     if(id && blog.id != id){
        //         return blog;
        //     }
        // }

        return blog;
    }

    async getMyBlogs(paginationDto: PaginationDto) {
        const { limit, page, skip } = PaginationResolver(paginationDto);
        const userId = this.req.user.id;

        const [blogs, count] = await this.blogRepository.findAndCount({
            where: {
                authorId: userId
            },
            order: {
                id: "DESC"
            },
            take: limit,
            skip
        });

        return {
            pagination: PaginationGenerate(page, limit, count),
            blogs
        }
    }

    async getAllBlogs(paginationDto: PaginationDto, filterBlogDto: Partial<FilterBlogDto>) {

        const { limit, page, skip } = PaginationResolver(paginationDto)

        let { category, search } = filterBlogDto

        // let where: FindOptionsWhere<BlogEntity> = {};
        let where: string = '';

        if (category) {
            if (where.length > 0) where += " AND ";
            where += `category.title = LOWER(:category)`
        }

        if (search) {
            if (where.length > 0) where += " AND ";
            search = `%${search}%`
            where += `CONCAT(blog.title,blog.content, blog.description) ILIKE :search`
        }

        let [blogs, count] = await this.blogRepository.createQueryBuilder(EntityName.Blog)
            .leftJoin('blog.categories', 'category')
            // .loadRelationCountAndMap('blog.likes','blog.likes')
            .leftJoin('blog.likes', 'likes')
            .leftJoin('blog.bookmarked', 'bookmarks')
            .leftJoinAndSelect('blog.comments', 'comments', "comments.accepted = :accept AND comments.parentId IS NULL", { 'accept': true })
            .leftJoinAndSelect('comments.children', 'com.children')
            .leftJoin('comments.user', 'writer')
            .leftJoin('writer.profile', 'user_profile')
            .leftJoin('blog.author', 'author')
            .leftJoin('author.profile', 'profile')
            .where(where, { category, search })
            .where(where, { category, search })
            .addSelect(['author.id', 'author.username', 'profile.nick_name', 'likes.id', 'category.title', 'bookmarks.id'])
            .addSelect(['writer.id', 'writer.username', 'user_profile.nick_name'])
            .orderBy("blog.id", "DESC")
            .addOrderBy('comments.id', 'DESC')
            .take(limit)
            .skip(skip)
            .getManyAndCount()

        //     let [blogs, count] = await this.blogRepository.findAndCount({relations: {
        //         author: true,
        //         likes: true,
        //         bookmarks: true,
        //         comments: true,
        //         categories: true
        //     },

        //     where,
        //     order : {
        //         id: "DESC"
        //     },
        //     select: {
        //         categories: {
        //             title: true
        //         }
        //     },
        //     take: limit,
        //     skip: skip
        // })

        blogs.map(blog => blog["likeCount"] = blog.likes.length);
        // blogs.map(blog => blog["bookmarkCount"] = blog.bookmarks.length);
        // blogs.map(blog => blog["commentCount"] = blog.comments.length);

        return {
            pagination: PaginationGenerate(page, limit, count),
            blogs
        }
    }

    async getBlogBySlug(slug: string, paginationDto: PaginationDto) {

        const userId = this.req.user?.id;

        let blog = await this.blogRepository.findOne({
            where: {
                slug
            },
            relations: {
                author: {
                    profile: true
                },
                bookmarked: true,
                likes: true,
                categories: true
            },
            select: {
                author: {
                    username: true,
                    profile: {
                        nick_name: true
                    }
                },
                categories: {
                    id: true,
                    title: true
                },
                bookmarked: {
                    id: true
                },
                likes: {
                    id: true
                }
            }
        });

        if (!blog) throw new NotFoundException("Blog not found.")

        blog['isBookmarked'] = !!blog.bookmarked.some(b => b.id === userId)
        blog['bookmarked'] = [];

        blog['isLiked'] = !!blog.likes.some(l => l.id === userId)
        blog['likeCount'] = blog.likes.length;

        let { comments, pagination } = await this.commentService.getBlogComments(blog.id, paginationDto);

        const suggestedBlogs = await this.getSuggestedBlogs();

        return {
            blog,
            commentPagination: pagination,
            comments,
            suggestedBlogs
        }
    }
    async getBlogById(blogId: number, paginationDto: PaginationDto) {

        const userId = this.req.user?.id;

        let blog = await this.blogRepository.findOne({
            where: {
                id: blogId
            },
            relations: {
                author: {
                    profile: true
                },
                bookmarked: true,
                likes: true,
                categories: true
            },
            select: {
                author: {
                    username: true,
                    profile: {
                        nick_name: true
                    }
                },
                bookmarked: {
                    id: true
                },
                likes: {
                    id: true
                },
                categories: {
                    id: true,
                    title: true
                }
            }
        });

        if (!blog) throw new NotFoundException("Blog not found.")

        blog['isBookmarked'] = !!blog.bookmarked.some(b => b.id === userId)
        blog['bookmarked'] = [];

        blog['isLiked'] = !!blog.likes.some(l => l.id === userId)
        blog['likeCount'] = blog.likes.length;

        let { comments, pagination } = await this.commentService.getBlogComments(blog.id, paginationDto);

        const suggestedBlogs = await this.getSuggestedBlogs();

        return {
            blog,
            commentPagination: pagination,
            comments,
            suggestedBlogs
        }
    }

    async getSuggestedBlogs() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        return await queryRunner.query(`
                WITH
	SUGGESTED_BLOG AS (
		SELECT
			BLOG.*,
			JSON_BUILD_OBJECT(
				'username',
				U.USERNAME,
				'author_name',
				P.NICK_NAME,
				'image',
				P.IMAGE_PROFILE
			) AS AUTHOR,
			ARRAY_AGG(DISTINCT (C.TITLE)) AS CATS,
			(
				SELECT
					COUNT(*)
				FROM
					BLOG_LIKE
				WHERE
					BLOG_ID = BLOG.ID
			) AS LIKES,
			(
				SELECT
					COUNT(*)
				FROM
					BLOG_BOOKMARK
				WHERE
					BLOG_ID = BLOG.ID
			) AS BOOKMARKS,
			(
				SELECT
					COUNT(*)
				FROM
					COMMENT
				WHERE
					"comment"."blogId" = BLOG.ID
			) AS "comments"
		FROM
			BLOG
			LEFT JOIN PUBLIC.USER U ON BLOG."authorId" = U.ID
			LEFT JOIN PROFILE P ON P."userId" = U.ID
			LEFT JOIN BLOG_CATEGORIES BC ON BC."blog_id" = BLOG.ID
			LEFT JOIN CATEGORY C ON C.ID = "bc"."category_id"
        WHERE "blog"."status" ILIKE '${BlogStatus.Draft}'
		GROUP BY
			BLOG.ID,
			BLOG.TITLE,
			U.USERNAME,
			P.NICK_NAME,
			P.IMAGE_PROFILE
		ORDER BY
			RANDOM()
		LIMIT
			3
	)
SELECT
	*
FROM
	SUGGESTED_BLOG
ORDER BY
	ID DESC
                `)
    }

    async delete(id: number) {
        const blog = await this.checkExistsBlogById(id);
        if (!blog) throw new NotFoundException("Blog not found");

        const deleteResult = await this.blogRepository.remove(blog)

        if (deleteResult) {
            return {
                message: "Blog deleted successfully."
            }
        } else {
            throw new BadRequestException("Blog did not deleted.")
        }
    }

    async update(id: number, blogDto: UpdateBlogDto, file: BlogImage) {
        let blog = await this.checkExistsBlogById(id);
        if (!blog) throw new NotFoundException("Blog not found");

        let { title, content, description, categories, image, slug } = blogDto;

        let categoryEntities: CategoryEntity[] = [];

        if (file?.image?.length > 0) {
            let [imageFile] = file.image;
            image = imageFile.path.slice(7);

            if (blog.image) {
                const imagePath = join("public", blog.image);
                unlinkSync(imagePath);
            }

            blog.image = image;
        }

        if (categories) {
            if (typeof categories === "string") {
                categories = categories.split(",");
            }


            if (Array.isArray(categories)) {

                blog.categories = [];

                for (const categoryTitle of categories) {
                    const title = categoryTitle.trim().toLowerCase();
                    let category = await this.categoryService.findOneByTitle(title);
                    if (!category) {
                        category = await this.categoryService.insertByTitle(title);
                    }
                    // Delete all former categories
                    // if(!categoryEntities.includes(category)){
                    // }
                    // categoryEntities.push(category);
                    blog.categories.push(category);
                }
                // blog.categories = categoryEntities;
            }
        }

        if (slug) {
            slug = await this.createSlug(slug ?? title, blog.id)
            blog.slug = slug;
        }

        if (content) {
            blog.content = content
            blog.time_to_study = calculateReadTime(content).timeFormat;
        }

        if (description) blog.description = description;
        if (title) blog.title = title;

        blog = await this.blogRepository.save(blog);
        return blog;
    }

    async checkExistsBlogById(id: number) {
        const blog = await this.blogRepository.findOneBy({ id });
        return blog;
    }
}
