import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';
import { Media } from '../media/media.entity';
import { CreatePersonDto } from './person.dto';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  findAll(): Promise<Person[]> {
    return this.personRepository.find({ relations: ['icon'] });
  }

  findOne(id: number): Promise<Person | null> {
    return this.personRepository.findOne({
      where: { id },
      relations: ['icon'],
    });
  }

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const person = new Person();
    Object.assign(person, createPersonDto);

    if (createPersonDto.icon) {
      const media = await this.mediaRepository.findOneBy({
        id: createPersonDto.icon,
      });
      if (!media) {
        throw new Error('Media not found');
      }
      person.icon = media;
    }

    return this.personRepository.save(person);
  }

  async update(
    id: number,
    updatePersonDto: CreatePersonDto,
  ): Promise<Person | null> {
    const person = await this.personRepository.findOneBy({ id });
    if (!person) {
      throw new Error('Person not found');
    }

    Object.assign(person, updatePersonDto);

    if (updatePersonDto.icon) {
      const media = await this.mediaRepository.findOneBy({
        id: updatePersonDto.icon,
      });
      if (!media) {
        throw new Error('Media not found');
      }
      person.icon = media;
    }

    await this.personRepository.update(id, person);
    return this.personRepository.findOne({
      where: { id },
      relations: ['icon'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.personRepository.delete(id);
  }
}
