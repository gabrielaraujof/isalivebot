import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

import { Client, Presence, ActivityType, VoiceState } from 'discord.js';
import { InjectDiscordClient, Once, On } from '@discord-nestjs/core';

import { ChatID, TelegramBotDomain } from '../../helper/contants';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private httpService: HttpService,
    private config: ConfigService,
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

    const streamingActivity = newPresence.activities.find(
      (activity) => activity.type === ActivityType.Streaming,
    );

    const member = newPresence.member;
    if (streamingActivity) {
      this.logger.log(
        `${member?.user.username || 'Someone'} just started streaming ${
          streamingActivity.name
        }!`,
      );
    }
  }

  @On('voiceStateUpdate')
  async onVoiceState(oldVoiceState: VoiceState, newVoiceState: VoiceState) {
    this.logger.log(`voiceStateUpdate: ${JSON.stringify(newVoiceState)}`);
    if (newVoiceState.streaming) {
      const guild = await this.client.guilds.cache.get(newVoiceState.guild.id);
      const channel = await guild?.channels.fetch(
        newVoiceState.channel?.id ?? '',
      );
      const user = await guild?.members.fetch(newVoiceState.member?.id ?? '');

      const message = `${user?.displayName} started streaming on ${guild?.name} ${channel?.name}`;
      this.logger.log(message);
      const chatId = this.config.get(ChatID);
      const url = `${this.config.get(TelegramBotDomain)}/notify`;
      this.logger.log(url, message, chatId);
      await firstValueFrom(
        this.httpService.post(`${this.config.get(TelegramBotDomain)}/notify`, {
          message,
          chatId,
        }),
      );
    }
  }
}
