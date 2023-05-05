import { Injectable, Logger } from '@nestjs/common';

import { Client } from 'discord.js';
import { InjectDiscordClient } from '@discord-nestjs/core';

@Injectable()
export class GuildService {
  private readonly logger = new Logger(GuildService.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  async getGuild(key: string | undefined) {
    if (!key) {
      throw new Error(`No guild key was provided`);
    }
    const guild = await this.client.guilds.cache.get(key);

    if (!guild) {
      throw new Error(`No guild was found`);
    }

    return guild;
  }
}
