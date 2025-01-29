import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  findAll(): Promise<Person[]> {
    return this.personRepository.find();
  }

  findOne(id: number): Promise<Person | null> {
    return this.personRepository.findOneBy({ id });
  }

  async create(person: Person): Promise<Person> {
    return this.personRepository.save(person);
  }

  async update(id: number, person: Person): Promise<Person | null> {
    await this.personRepository.update(id, person);
    return this.personRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.personRepository.delete(id);
  }
} 