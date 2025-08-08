import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SensorDAO } from "./SensorDAO";

@Entity("measurements")
export class MeasurementDAO {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({type: "numeric", nullable: false })
  value!: number;

  @Column({ nullable: false })
  createdAt!: Date;

  @ManyToOne(() => SensorDAO, (sensor) => sensor.measurements, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sensor_id" })
  sensor!: SensorDAO;
}