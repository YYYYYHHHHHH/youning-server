import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../project/project.entity';
import { Media } from '../media/media.entity';

@Entity('project_media_relations')
export class ProjectMediaRelation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.projectMediaRelations)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => Media)
  @JoinColumn({ name: 'mediaId' })
  media: Media;
}