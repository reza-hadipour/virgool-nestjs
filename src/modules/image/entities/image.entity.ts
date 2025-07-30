import { map } from "rxjs";
import { BaseEntity } from "src/common/abstracts/BaseEntity.abstract";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { AfterLoad, Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";

@Entity(EntityName.Image)
export class ImageEntity extends BaseEntity {
    @Column()
    name: string
    @Column()
    location: string
    @Column()
    alt: string
    @Column()
    userId: number
    @CreateDateColumn()
    created_at: Date
    @ManyToOne(()=> UserEntity, user => user.images)
    user: UserEntity

    @AfterLoad()
    x(){
        this.location = `http:\\${process.env.HOST}:${process.env.PORT}\\${this.location}`
    }
    
}
