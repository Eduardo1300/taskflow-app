import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; fullName?: string }) {
    return this.authService.register(body.email, body.password, body.fullName);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    const profile = await this.authService.getProfile(req.user.userId);
    return { user: profile };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Request() req) {
    const profile = await this.authService.getProfile(req.user.userId);
    return { user: profile };
  }
}
