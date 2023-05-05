import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Activity,
  Channel,
  Guild,
  GuildBasedChannel,
  GuildMember,
} from 'discord.js';

import { ChatID, TelegramBotDomain } from '../../helper/contants';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  private readonly url = `${this.config.get(TelegramBotDomain)}/notify`;
  private readonly chatId = this.config.get(ChatID);

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  notify(message: string) {
    this.logger.log('Notfifying group in', this.url, message, this.chatId);
    return this.httpService.post(this.url, {
      message,
      chatId: this.chatId,
    });
  }

  notifyIsPlaying(user: GuildMember, activity: Activity) {
    const { displayName = 'Alguém' } = user;
    const message = `${displayName} começou a jogar ${activity.name}!`;
    return this.notify(message);
  }

  notifyIsStreaming(
    guild: Guild,
    member: GuildMember,
    channel: GuildBasedChannel | null,
  ) {
    const { name: guildName = '' } = guild;
    const { displayName = 'Alguém' } = member;
    const { name: channelName = '' } = channel ?? {};
    const message = `${displayName} abriu a live ${
      ` em ${guildName} ${channelName}` ? guildName || channelName : ''
    }! Corre lá!`;
    return this.notify(message);
  }
}
