interface mergeStrategyInterface<T> {
  (older: T, newer: T): T;
}

export const concatMergeStrategy: mergeStrategyInterface<Array<any>> = (older, newer) => [
  ...older,
  ...newer,
];

export const shallowMergeStrategy: mergeStrategyInterface<Record<string, unknown>> = (
  older,
  newer
) => ({
  ...older,
  ...newer,
});

export const overrideMergeStrategy: mergeStrategyInterface<any> = (older, newData) => newData;

export const MergeIndexArrayStrategy: mergeStrategyInterface<Array<number>> = (older, newer) => {
  return [...new Set(older.concat(newer))];
};
