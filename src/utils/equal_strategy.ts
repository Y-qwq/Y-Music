import { isEqual } from 'lodash-es';

export const deepEqualStrategy = isEqual;
export const shallowEqualStrategy = (older: any, newer: any) => older === newer;
