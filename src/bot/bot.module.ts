import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { GatewayIntentBits } from 'discord.js';
import { DiscordModule } from '@discord-nestjs/core';

import { DiscordBotToken } from '../helper/contants';
import { GatewayService } from './gateway/gateway.service';
import { MessageService } from './message/message.service';
import { GuildService } from './guild/guild.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get(DiscordBotToken, ''),
        discordClientOptions: {
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildVoiceStates,
          ],
        },
      }),
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  providers: [GatewayService, MessageService, GuildService],
})
export class BotModule {}
