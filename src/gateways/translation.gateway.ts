// src/gateways/translation.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

type ClientCtx = {
  pushStream: sdk.PushAudioInputStream;
  recognizer: sdk.TranslationRecognizer;
  synth: sdk.SpeechSynthesizer;
  speechConfig: sdk.SpeechTranslationConfig; // guardamos config
  sampleRate: number;
  targetLang: string;
  busy: boolean;
};

@Injectable()
@WebSocketGateway({ namespace: '/traducir', cors: true })
export class TranslationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  private readonly logger = new Logger(TranslationGateway.name);

  private clients = new Map<string, ClientCtx>();

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    const ctx = this.clients.get(client.id);
    if (ctx) {
      try {
        ctx.recognizer.close();
        ctx.synth.close();
      } catch {}
      this.clients.delete(client.id);
    }
  }

  @SubscribeMessage('azure:start')
  async start(
    @MessageBody()
    data: { from: string; to: string; sampleRate: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { from, to, sampleRate } = data;

      const speechConfig = sdk.SpeechTranslationConfig.fromSubscription(
        process.env.AZ_SPEECH_KEY!,
        process.env.AZ_SPEECH_REGION!,
      );
      speechConfig.speechRecognitionLanguage = from;
      speechConfig.addTargetLanguage(to);

      // Formato correcto
      const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(
        sampleRate,
        16,
        1,
      );
      const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);
      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

      const recognizer = new sdk.TranslationRecognizer(
        speechConfig,
        audioConfig,
      );

      // TTS
      const synthConfig = sdk.SpeechConfig.fromSubscription(
        process.env.AZ_SPEECH_KEY!,
        process.env.AZ_SPEECH_REGION!,
      );
      synthConfig.speechSynthesisLanguage = to;
      synthConfig.speechSynthesisVoiceName = `${to}-AriaNeural`;
      const synth = new sdk.SpeechSynthesizer(synthConfig);

      this.clients.set(client.id, {
        pushStream,
        recognizer,
        synth,
        speechConfig,
        sampleRate,
        targetLang: to,
        busy: false,
      });

      client.emit('azure:ready');
      this.logger.log(`[${client.id}] Azure start OK`);
    } catch (e) {
      this.logger.error(e);
      client.emit('azure:error', { msg: 'Error inicializando Azure', e });
    }
  }

  @SubscribeMessage('azure:chunk')
  onChunk(@MessageBody() data: ArrayBuffer, @ConnectedSocket() client: Socket) {
    const ctx = this.clients.get(client.id);
    if (!ctx) return;
    ctx.pushStream.write(Buffer.from(data));
  }

  @SubscribeMessage('azure:stop')
  async stop(@ConnectedSocket() client: Socket) {
    const ctx = this.clients.get(client.id);
    if (!ctx || ctx.busy) return;

    ctx.busy = true;
    ctx.pushStream.close();
    this.logger.log(`[${client.id}] pushStream closed, recognizing...`);

    await new Promise<void>((resolve) => {
      ctx.recognizer.recognizeOnceAsync(async (result) => {
        try {
          let original = '';
          let translated = '';

          if (result.reason === sdk.ResultReason.TranslatedSpeech) {
            original = result.text;
            translated =
              result.translations.get(ctx.targetLang) ?? '(sin traducción)';
          } else if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            original = result.text;
            translated = '(no hubo traducción)';
          } else {
            this.logger.warn(`[${client.id}] No recognized speech`);
          }

          let audioBase64: string | null = null;
          if (translated && translated !== '(sin traducción)') {
            const synthResult = await new Promise<sdk.SpeechSynthesisResult>(
              (res, rej) => {
                ctx.synth.speakTextAsync(translated, res, rej);
              },
            );
            if (
              synthResult.reason === sdk.ResultReason.SynthesizingAudioCompleted
            ) {
              audioBase64 = Buffer.from(synthResult.audioData).toString(
                'base64',
              );
            }
          }

          client.emit('translationResult', {
            original,
            translated,
            audioBase64,
          });
        } catch (err) {
          this.logger.error(err);
          client.emit('azure:error', {
            msg: 'Error procesando resultado',
            err,
          });
        } finally {
          // Reiniciar ciclo
          const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(
            ctx.sampleRate,
            16,
            1,
          );
          const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);
          const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
          ctx.pushStream = pushStream;
          ctx.recognizer = new sdk.TranslationRecognizer(
            ctx.speechConfig,
            audioConfig,
          );
          ctx.busy = false;
          resolve();
        }
      });
    });
  }
}
