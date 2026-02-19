import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  async findById(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async update(id: string, data: Partial<Profile>): Promise<Profile> {
    await this.profileRepository.update(id, data);
    return this.findById(id);
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return this.profileRepository.findOne({ where: { email } });
  }
}
