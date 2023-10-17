import { Entity, PrimaryGeneratedColumn } from "typeorm";

export abstract class GeneralModule {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id!: number;
}
