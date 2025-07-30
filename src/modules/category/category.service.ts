import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { PublicMessages } from 'src/common/enums/messages.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationGenerate, PaginationResolver } from 'src/common/utils/pagination.util';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity) private categoryRepository: Repository<CategoryEntity>){}

  async create(createCategoryDto: CreateCategoryDto) {
    let {title, priority} = createCategoryDto;
    title = await this.checkExistAndResolveTitle(title);
    let newCat = this.categoryRepository.create({title, priority});
    newCat = await this.categoryRepository.save(newCat);

    return {
      message: PublicMessages.createdSuccessfully,
      category: newCat
    }
  }

  async checkExistAndResolveTitle(title: string){
    title = title.trim().toLowerCase();
    const cat = await this.categoryRepository.findOneBy({title});
    if(cat) throw new ConflictException("Category name is already used.")
    return title;
  }

  async insertByTitle(title: string) {
    let newCat = this.categoryRepository.create({title});
    return await this.categoryRepository.save(newCat);
  }

  async findOneByTitle(title: string){
    return await this.categoryRepository.findOneBy({title});
  }

  async findAll(paginationDto: PaginationDto) {
    const {page,limit,skip} = PaginationResolver(paginationDto)
    
    const [categories, catCount] = await this.categoryRepository.findAndCount({
      where:{},
      skip: skip,
      take: limit 
    });
    
    return {
      pagination: PaginationGenerate(page,limit,catCount),
      categories
    }
  }

  async findOne(id: number) {
    const cat = await this.categoryRepository.findOneBy({id});
    if (!cat) throw new NotFoundException("Category not found.")
    return cat;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const {title,priority} = updateCategoryDto;
    
    let category = await this.findOne(id);
    
    if(title) category.title = title;
    if(priority) category.priority = priority;
    category = await this.categoryRepository.save(category);

    return {
      message: "Category updated successfully",
      category
    }
  }

  async remove(id: number) {
    let category = await this.findOne(id);
    this.categoryRepository.delete(id);
    return `This action removes a #${id} category`;
  }
}
