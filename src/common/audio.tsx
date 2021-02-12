import { AudioOptions } from '@/types';

let audio: HTMLAudioElement | null = null;

type IAudioOptions = Partial<AudioOptions>;

class SingleAudio {
  options: IAudioOptions;

  constructor(options?: IAudioOptions) {
    this.options = options || {};
  }

  initAudio = (options: IAudioOptions = {}) => {
    audio = new Audio();
    const keys = Object.keys(options) as Array<keyof AudioOptions>;
    keys.forEach(key => {
      const value = options[key];
      (audio as any)[key] = value;
    });
    return audio;
  };

  getAudio() {
    return audio ?? this.initAudio(this.options);
  }
}

export const GolbalAudio = new SingleAudio();
