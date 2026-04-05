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
    const allowedFields = ['full_name', 'phone', 'location', 'bio', 'avatar', 'timezone', 'language'];
    const updateData: Partial<Profile> = {};
    
    for (const field of allowedFields) {
      if (field in data && data[field as keyof Profile] !== undefined) {
        const value = data[field as keyof Profile];
        if (value !== null && typeof value === 'string') {
          (updateData as any)[field] = value;
        }
      }
    }
    
    if (Object.keys(updateData).length > 0) {
      await this.profileRepository.update(id, updateData);
    }
    return this.findById(id);
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return this.profileRepository.findOne({ where: { email } });
  }
}
