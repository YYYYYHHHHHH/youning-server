import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectReport } from '../project-report/project-report.entity';
import { Media } from '../media/media.entity';

@Entity()
export class ProjectReportMedia {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ProjectReport)
  @JoinColumn()
  projectReport!: ProjectReport;

  @ManyToOne(() => Media)
  @JoinColumn()
  media!: Media;
}
