import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { SensorDAO } from "@dao/SensorDAO";

@Entity("gateways")
export class GatewayDAO {
  @PrimaryColumn({ name: "macAddress", nullable: false })
  macAddress: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @ManyToOne(() => NetworkDAO, (network) => network.gateways, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "network_code", referencedColumnName: "code" })
  network: NetworkDAO;

  @OneToMany(() => SensorDAO, (sensor) => sensor.gateway)
  sensors: SensorDAO[];
}