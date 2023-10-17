import { EntityTarget, ObjectLiteral } from "typeorm";
import { z } from "zod";
import { PostgresDataSource } from "../db/postgres/postgres-data-source";
import { BaseService } from "./BaseService";
import { GeneralModule } from "src/models/GeneralModule";

export abstract class ConnectedEntityService<
  Type extends GeneralModule
> extends BaseService<Type> {
  abstract setConnectedFields(entity: Type, entityInput: any): Promise<void>;

  protected connectedEntitySchema = z.object({
    id: z.number(),
  });

  async setConnectedField<Entity extends ObjectLiteral>(
    entity: Type,
    entityInput: any,
    connectedEntityFieldName: string,
    setter: (entity: Type, connectedEntity: any) => void,
    connectedEntityClass: EntityTarget<Entity>
  ) {
    const connectedEntityId = entityInput[connectedEntityFieldName]?.id;
    if (connectedEntityId) {
      const repository = PostgresDataSource.getRepository(connectedEntityClass);
      const connectedEntity = await repository.findOne({
        where: {
          id: connectedEntityId,
        },
      });

      if (!connectedEntity) {
        throw new Error(
          `${connectedEntityFieldName}: ${connectedEntityId} does not exist in the database`
        );
      }

      setter(entity, connectedEntity);
    }
  }

  async setConnectedFieldsList<Entity extends ObjectLiteral>(
    entity: Type,
    entityInput: any,
    connectedEntityFieldListName: string,
    setter: (entity: Type, connectedEntity: any) => void,
    connectedEntityClass: EntityTarget<Entity>
  ) {
    const connectedEntityInputList: any[] =
      entityInput[connectedEntityFieldListName];
    const repository = PostgresDataSource.getRepository(connectedEntityClass);
    const connectedEntitiesList: any = [];
    if (connectedEntityInputList) {
      for (const connectedEntityInput of connectedEntityInputList) {
        const connectedEntityId = connectedEntityInput?.id;
        const connectedEntity = await repository.findOne({
          where: {
            id: connectedEntityId,
          },
        });

        if (!connectedEntity) {
          throw new Error(
            `${connectedEntityFieldListName}: ${connectedEntityId} does not exist in the database`
          );
        }

        connectedEntitiesList.push(connectedEntity);
      }

      setter(entity, connectedEntitiesList);
    }
  }

  async setChildrenList<Entity extends ObjectLiteral>(
    entity: Type,
    entityInput: any,
    connectedEntityFieldName: string,
    setter: (entity: Type, connectedEntity: any) => void,
    connectedEntityClass: EntityTarget<Entity>
  ) {
    const childrenInputList = entityInput[connectedEntityFieldName];
    if (childrenInputList) {
      const repository = PostgresDataSource.getRepository(connectedEntityClass);
      const childrenList: any = [];
      for (const childInput of childrenInputList) {
        if (childInput.id) {
          const fetchedChildEntity = repository.findOne({
            where: {
              id: childInput.id,
            },
          });

          if (!fetchedChildEntity) {
            throw new Error(
              `${connectedEntityFieldName}: ${childInput.id} does not exist in the database`
            );
          }
          const childEntity: any = repository.create(childInput);
          // TODO: make sure teh update is necessary
          await repository.update(childInput.id, childEntity);
          childrenList.push(childEntity);
        } else {
          const childEntity = repository.create(childInput);
          childrenList.push(childEntity);
        }
      }

      if (childrenList.length !== childrenInputList.length) {
        throw new Error(
          `${connectedEntityFieldName}: error in creating children list`
        );
      }

      setter(entity, childrenList);
    }
  }
}
