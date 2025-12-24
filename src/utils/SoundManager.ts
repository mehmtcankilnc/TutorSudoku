import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const soundPools: { [key: string]: Sound[] } = {};
const poolIndexes: { [key: string]: number } = {};
let isSoundEnabled = true;

const POOL_SIZE = 5;

export const setSoundEnabled = (enabled: boolean) => {
  isSoundEnabled = enabled;
};

export const loadSounds = () => {
  const soundFiles = {
    click: 'click_effect.wav',
    completed: 'completed_effect.mp3',
    correct: 'correct_number_effect.wav',
    delete: 'delete_effect.mp3',
    hint: 'hint_effect.wav',
    wrong: 'wrong_number_effect.wav',
  };

  Object.keys(soundFiles).forEach(key => {
    const fileName = soundFiles[key as keyof typeof soundFiles];
    soundPools[key] = [];
    poolIndexes[key] = 0;

    const count = key === 'click' ? POOL_SIZE : 3;

    for (let i = 0; i < count; i++) {
      const s = new Sound(fileName, Sound.MAIN_BUNDLE, error => {
        if (error) {
          return;
        }
      });
      soundPools[key].push(s);
    }
  });
};

export const playSound = (
  type: 'click' | 'correct' | 'wrong' | 'completed' | 'delete' | 'hint',
) => {
  if (!isSoundEnabled) return;

  const pool = soundPools[type];
  if (pool && pool.length > 0) {
    const index = poolIndexes[type];
    const sound = pool[index];

    poolIndexes[type] = (index + 1) % pool.length;

    const volumes: { [key: string]: number } = {
      click: 0.3,
      correct: 0.8,
      wrong: 0.6,
      delete: 0.5,
      hint: 0.8,
      completed: 1.0,
    };

    sound.setVolume(volumes[type] ?? 1.0);
    sound.play(success => {
      if (!success) {
        sound.reset();
      }
    });
  }
};
