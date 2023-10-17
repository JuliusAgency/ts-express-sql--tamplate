import { NextFunction, Request, Response } from "express";
import { In } from "typeorm";
import {
  PAGE_NUMBER_HEADER_NAME,
  PAGE_SIZE_HEADER_NAME,
} from "../constants/Consts";
import { GeneralModule } from "src/models/GeneralModule";
import { AppError, ResponseCode } from "../modules/error-handler/AppError";
import { BaseService } from "../services/BaseService";

export abstract class BaseController<Type extends GeneralModule> {
  protected readonly service: BaseService<Type>;
  protected abstract entityName: string;

  constructor(service: BaseService<Type>) {
    this.service = service;
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const entityInput = this.extractInputFromRequest(req);

      if (this.service.hasId(entityInput)) {
        next(
          new AppError({
            code: ResponseCode.UNPORCESSABLE_ENTITY,
            description: `Illegal input: cannot provide id in creation process`,
          })
        );
      } else {
        this.service.getEntitySchema().parse(entityInput);

        const entity = this.service.createNewInstance(entityInput);

        const savedEntity = await this.service.save(entity);

        res.json({ [this.entityName]: savedEntity });
      }
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const entityInput = this.extractInputFromRequest(req);

      if (!this.service.hasId(entityInput)) {
        next(
          new AppError({
            code: ResponseCode.UNPORCESSABLE_ENTITY,
            description: "id field is required in update process",
          })
        );
      } else {
        const entityId = this.service.getId(entityInput);
        const queryResult = await this.service.getById(entityId);
        if (!queryResult) {
          next(
            new AppError({
              code: ResponseCode.UNPORCESSABLE_ENTITY,
              description: `${this.entityName} with id: ${entityId} does not exist`,
            })
          );
        } else {
          this.service.getEntitySchema().partial().parse(entityInput);

          await this.service.update(entityInput);

          res.send({ [this.entityName]: entityInput });
        }
      }
    } catch (err) {
      next(err);
    }
  }

  async getAll(
    req: Request,
    res: Response,
    next: NextFunction,
    whereStatement?: any
  ) {
    try {
      const pageSize = this.extractPageHeaderValue(
        req.headers[PAGE_SIZE_HEADER_NAME]
      );
      const pageNumber =
        this.extractPageHeaderValue(req.headers[PAGE_NUMBER_HEADER_NAME]) || 1;

      const [entities, totalCount] = await this.getAllFetcher(
        req,
        pageSize,
        pageNumber,
        whereStatement
      );

      if (req.query.fields) {
        const parsedFields = JSON.parse(String(req.query.fields));
        this.removeFieldsFromEntities(entities, parsedFields);
      }

      const responseJSON: any = {
        entities: entities,
        totalCount: totalCount,
      };

      if (pageNumber && pageSize) {
        responseJSON["totalPages"] = Math.ceil(totalCount / pageSize);
        responseJSON["pageNumber"] = pageNumber;
      }

      res.json(responseJSON);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await this.service.getById(req.params.id));
    } catch (err) {
      next(err);
    }
  }

  removeFieldsFromEntities(entities: any[], fields: string[]) {
    entities.forEach((entity) => {
      Object.keys(entity).forEach((key) => {
        if (fields.indexOf(key) === -1) {
          delete entity[key];
        }
      });
    });
  }

  // TODO: extract all of these methods to a util class
  protected extractInputFromRequest(req: Request) {
    return req.body[this.entityName];
  }

  private extractPageHeaderValue(
    header: string | string[] | undefined
  ): number | undefined {
    let headerValue;
    if (header) {
      headerValue = Array.isArray(header) ? header[0] : header;
    }

    return headerValue ? parseInt(headerValue) : undefined;
  }

  async getAllFetcher(
    req: Request,
    pageSize?: number,
    pageNumber?: number,
    whereStatement?: any
  ) {
    let where: any[] = this.createWhereStatements(req);
    if (whereStatement) {
      where =
        where.length !== 0
          ? where.map((currentWhere) => ({
              ...currentWhere,
              ...whereStatement,
            }))
          : whereStatement;
    }
    let take;
    let skip;

    if (pageNumber && pageSize) {
      take = pageSize;
      skip = (pageNumber - 1) * pageSize;
    }

    return await this.service.findWithArgs(where, take, skip);
  }

  createWhereStatements(req: Request) {
    const whereStatements = [];
    const filters = req.query.filters;

    if (filters && typeof filters === "string") {
      const parsedFilters = JSON.parse(String(filters));

      const where: any = {};
      for (const field in parsedFilters) {
        const values = parsedFilters[field];
        where[field] = this.adjustValuesToWhereStatement(values);
      }

      if (Object.keys(where).length !== 0) {
        whereStatements.push(where);
      }
    }

    return whereStatements;
  }

  adjustValuesToWhereStatement(input: any): any {
    if (typeof input !== "object" || input === null) {
      // If the input is not an object, or it's null, return it as is.
      return input;
    }

    if (Array.isArray(input)) {
      // If it's an array, convert each element to a string.
      return In(input);
    }

    // If it's an object, recursively iterate over its fields and process them.
    const result: Record<string, any> = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        result[key] = this.adjustValuesToWhereStatement(input[key]);
      }
    }

    return result;
  }
}
