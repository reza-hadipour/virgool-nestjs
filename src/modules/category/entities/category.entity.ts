import { BaseEntity } from "src/common/abstracts/BaseEntity.abstract";
import { EntityName } from "src/common/enums/entity.enum";
import { BlogEntity } from "src/modules/blog/entity/blog.entity";
import { Column, Entity, ManyToMany } from "typeorm";

@Entity(EntityName.Category)
export class CategoryEntity extends BaseEntity {
    @Column()
    title: string
    @Column({nullable: true})
    priority: number
    @ManyToMany(()=> BlogEntity, blog => blog.categories)
    blogs: BlogEntity[]
}
