import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  Client,
  Presence,
  ActivityType,
  VoiceState,
  Activity,
} from 'discord.js';
import { InjectDiscordClient, Once, On } from '@discord-nestjs/core';
import { firstValueFrom } from 'rxjs';

import { MessageService } from '../message/message.service';
import { GuildService } from '../guild/guild.service';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private messenger: MessageService,
    private guild: GuildService,
  ) {}

  @Once('ready')
  onReady() {
    this.logger.log(`Bot ${this.client.user?.tag} was started!`);
  }

  @On('presenceUpdate')
  async onPresence(
    oldPresence: Presence,
    newPresence: Presence,
  ): Promise<void> {
    if (!newPresence.activities) return;

    this.logger.log(`presenceUpdate: ${JSON.stringify(newPresence)}`);

    const isPlaying = (activity: Activity) =>
      activity.type === ActivityType.Playing;
    const oldPlayingActivity = oldPresence.activities.find(isPlaying);
    const newPlayingActivity = newPresence.activities.find(isPlaying);

    if (!oldPlayingActivity && newPlayingActivity) {
      try {
        const guild = await this.guild.getGuild(newPresence?.guild?.id);
        const member = await guild.members.fetch(newPresence.member?.id ?? '');
        await firstValueFrom(
          this.messenger.notifyIsPlaying(member, newPlayingActivity),
        );
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  @On('voiceStateUpdate')
  async onVoiceState(_: VoiceState, newVoiceState: VoiceState) {
    this.logger.log(`voiceStateUpdate: ${JSON.stringify(newVoiceState)}`);

    if (newVoiceState.streaming) {
      try {
        const guild = await this.guild.getGuild(newVoiceState?.guild?.id);
        const channel = await guild?.channels.fetch(
          newVoiceState.channel?.id ?? '',
        );
        const user = await guild?.members.fetch(newVoiceState.member?.id ?? '');
        await firstValueFrom(
          this.messenger.notifyIsStreaming(guild, user, channel),
        );
      } catch (error) {
        this.logger.error(error);
      }
    }
  }
}
