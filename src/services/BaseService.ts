import { GeneralModule } from "src/models/GeneralModule";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { AnyZodObject } from "zod";

export abstract class BaseService<Type extends GeneralModule> {
  private readonly repository: Repository<Type>;

  constructor(repository: Repository<Type>) {
    this.repository = repository;
  }

  public abstract getEntitySchema(): AnyZodObject;

  createNewInstance(entityInput: DeepPartial<Type>): Type {
    return this.repository.create(entityInput);
  }

  async save(entity: Type) {
    return await this.repository.save(entity);
  }

  async update(entity: any) {
    return await this.repository.update(entity.id, entity);
  }

  async getById(id: any) {
    return await this.repository.findOne({
      where: {
        id: id,
      },
    });
  }

  hasId(entity: any) {
    return this.repository.hasId(entity);
  }

  getId(entity: any) {
    return this.repository.getId(entity);
  }

  async findWithArgs(
    where: FindOptionsWhere<Type>[] | undefined,
    take: number | undefined,
    skip: number | undefined
  ) {
    return await this.repository.findAndCount({
      where: where,
      skip: skip,
      take: take,
    });
  }
}
