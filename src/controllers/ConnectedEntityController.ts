import { NextFunction, Request, Response } from "express";
import { ConnectedEntityService } from "src/services/ConnectedEntityService";
import { AppError, ResponseCode } from "../modules/error-handler/AppError";
import { BaseController } from "./BaseController";
import { GeneralModule } from "src/models/GeneralModule";

export abstract class ConnectedEntityController<
  Type extends GeneralModule
> extends BaseController<Type> {
  protected abstract entityName: string;
  private connectedEntitySerivce: ConnectedEntityService<Type>;

  constructor(service: ConnectedEntityService<Type>) {
    super(service);
    this.connectedEntitySerivce = service;
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const entityInput = super.extractInputFromRequest(req);

      if (this.service.hasId(entityInput)) {
        next(
          new AppError({
            code: ResponseCode.UNPORCESSABLE_ENTITY,
            description: `Illegal input: cannot provide id in creation process`,
          })
        );
      } else {
        this.service.getEntitySchema().parse(entityInput);

        const entity =
          this.connectedEntitySerivce.createNewInstance(entityInput);
        await this.connectedEntitySerivce.setConnectedFields(
          entity,
          entityInput
        );

        const savedEntity = await this.service.save(entity);

        res.json({ [this.entityName]: savedEntity });
      }
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const entityInput = super.extractInputFromRequest(req);

      if (!this.service.hasId(entityInput)) {
        next(
          new AppError({
            code: ResponseCode.UNPORCESSABLE_ENTITY,
            description: "id field is required in update process",
          })
        );
      } else {
        const entityId = this.service.getId(entityInput);
        const entity = await this.service.getById(entityId);
        if (!entity) {
          next(
            new AppError({
              code: ResponseCode.UNPORCESSABLE_ENTITY,
              description: `${this.entityName} with id: ${entityId} does not exist`,
            })
          );
        } else {
          this.service.getEntitySchema().partial().parse(entityInput);

          const entity =
            this.connectedEntitySerivce.createNewInstance(entityInput);
          await this.connectedEntitySerivce.setConnectedFields(
            entity,
            entityInput
          );

          await this.service.save(entity);

          res.send({ [this.entityName]: entity });
        }
      }
    } catch (err) {
      next(err);
    }
  }
}
