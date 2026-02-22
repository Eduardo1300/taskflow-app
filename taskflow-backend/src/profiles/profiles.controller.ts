import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get('me')
  async findMe(@Request() req) {
    const profile = await this.profilesService.findById(req.user.userId);
    return { data: profile };
  }

  @Put('me')
  async updateMe(@Request() req, @Body() body: any) {
    const profile = await this.profilesService.update(req.user.userId, body);
    return { data: profile };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const profile = await this.profilesService.findById(id);
    return { data: profile };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const profile = await this.profilesService.update(id, body);
    return { data: profile };
  }
}
