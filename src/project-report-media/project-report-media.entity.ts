import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ProjectReport } from '../project-report/project-report.entity';
import { Media } from '../media/media.entity';

@Entity()
export class ProjectReportMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProjectReport)
  projectReport: ProjectReport;

  @ManyToOne(() => Media)
  media: Media;
} 