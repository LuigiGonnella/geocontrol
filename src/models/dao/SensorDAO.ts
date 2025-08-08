import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { GatewayDAO } from "@dao/GatewayDAO";
import { MeasurementDAO } from "@dao/MeasurementDAO";

@Entity("sensors")
export class SensorDAO {
  @PrimaryColumn({ name: "macAddress", nullable: false })
  macAddress: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  variable: string;

  @Column({ nullable: false })
  unit: string;

  @ManyToOne(() => GatewayDAO, (gateway) => gateway.sensors, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "gateway_mac_address", referencedColumnName: "macAddress" })
  gateway: GatewayDAO;

  @OneToMany(() => MeasurementDAO, (measurement) => measurement.sensor)
  measurements: MeasurementDAO[];
}