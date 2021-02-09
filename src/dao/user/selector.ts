import { DATA_KEY } from '@/enums';
import { IState } from '@/types';

export const userProfileSelector = (state: IState) => state[DATA_KEY.USER].profile;
