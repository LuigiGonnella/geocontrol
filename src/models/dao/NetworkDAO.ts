import { GatewayDAO } from '@dao/GatewayDAO';
import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";

@Entity("networks")
export class NetworkDAO {
  @PrimaryColumn({ nullable: false })
  code: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @OneToMany(() => GatewayDAO, (gateway) => gateway.network)
  gateways: GatewayDAO[];
}