import { PaginationDto } from "../dto/pagination.dto";

export function PaginationResolver( paginationDto :PaginationDto){
    let {page= 0, limit = 10} = paginationDto;
    if(!page || page <= 1) page = 0
    else page = page - 1

    return {
        skip: page * limit,
        limit,
        page: page + 1,
    }
}

export function PaginationGenerate(page: number, limit: number, count: number){
    return {
        total: +count,
        page: +page,
        limit: +limit,
        totalPages: Math.ceil(count / limit)
    }
}

export function PaginateCustomList(list: any[], paginationDto: PaginationDto){
    const {limit,page,skip} = PaginationResolver(paginationDto)
    const selectedList = list?.slice(skip, +limit + skip);
    const pagination = PaginationGenerate(page, limit, list.length)

    return {
      pagination,
      list: selectedList
    }
  }