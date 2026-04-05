import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Profile } from '../profiles/profile.entity';
import { Task } from '../tasks/task.entity';
import { Category } from '../categories/category.entity';
import { Goal } from '../goals/goal.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, fullName?: string) {
    const existing = await this.profileRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const profile = this.profileRepository.create({
      id: crypto.randomUUID(),
      email,
      full_name: fullName || null,
    });
    await this.profileRepository.save(profile);

    const payload = { sub: profile.id, email: profile.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: profile,
    };
  }

  async login(email: string, password: string) {
    const profile = await this.profileRepository.findOne({ where: { email } });
    if (!profile) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tasks = await this.taskRepository.find({
      where: { user_id: profile.id },
      order: { created_at: 'DESC' },
    });

    const categories = await this.categoryRepository.find({
      where: { user_id: profile.id },
    });

    const goals = await this.goalRepository.find({
      where: { user_id: profile.id },
    });

    const payload = { sub: profile.id, email: profile.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: profile,
      tasks,
      categories,
      goals,
    };
  }

  async validateUser(userId: string): Promise<Profile | null> {
    return this.profileRepository.findOne({ where: { id: userId } });
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return this.profileRepository.findOne({ where: { id: userId } });
  }

  async updateProfile(userId: string, data: { full_name?: string }): Promise<Profile> {
    await this.profileRepository.update(userId, data);
    return this.getProfile(userId);
  }
}
