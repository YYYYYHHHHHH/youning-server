import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SalesProject } from '../sales-project/sales-project.entity';
import { Media } from '../media/media.entity';

@Entity('sales_project_photos')
export class ProjectPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  createTime: Date;

  @ManyToOne(() => SalesProject, salesProject => salesProject.projectPhotos)
  @JoinColumn({ name: 'sales_project_id' })
  salesProject: SalesProject;

  @ManyToOne(() => Media)
  @JoinColumn({ name: 'media_id' })
  media: Media;
}