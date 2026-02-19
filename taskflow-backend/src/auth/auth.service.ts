import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Profile } from '../profiles/profile.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
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
      user: { id: profile.id, email: profile.email, full_name: profile.full_name },
    };
  }

  async login(email: string, password: string) {
    const profile = await this.profileRepository.findOne({ where: { email } });
    if (!profile) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: profile.id, email: profile.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: profile.id, email: profile.email, full_name: profile.full_name },
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
