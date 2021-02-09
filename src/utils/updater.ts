import { deepEqualStrategy } from '@utils/equal_strategy';
import { overrideMergeStrategy } from '@utils/merge_strategy';

interface Iconfig {
  merge: <T>(older: T, newer: T) => T;
  equal: (older: unknown, newer: unknown) => boolean;
}

const defaultConfig: Iconfig = {
  merge: overrideMergeStrategy,
  equal: deepEqualStrategy,
};

export const updater = new (class Updater {
  update = <T>(older: T, newer: T, config: Partial<Iconfig> = defaultConfig) => {
    const { merge, equal } = { ...defaultConfig, ...config };
    if (equal(older, newer)) return older;
    return merge(older, newer);
  };
})();
