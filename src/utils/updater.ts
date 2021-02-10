import { deepEqualStrategy } from '@/utils/equal_strategy';
import { overrideMergeStrategy } from '@/utils/merge_strategy';

interface Iconfig<T> {
  merge: (older: T, newer: T) => T;
  equal: (older: any, newer: any) => boolean;
}

const defaultConfig = {
  merge: overrideMergeStrategy,
  equal: deepEqualStrategy,
};

export const updater = new (class Updater {
  update = <T>(older: T, newer: T, config: Partial<Iconfig<T>>) => {
    const { merge, equal } = {
      ...defaultConfig,
      ...config,
    };
    if (equal(older, newer)) return older;
    return merge(older, newer);
  };
})();
