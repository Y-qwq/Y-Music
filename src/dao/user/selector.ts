import { DATA_KEY } from '@enums/index';
import { IState } from '@redux/index';

export const userProfileSelector = (state: IState) => state[DATA_KEY.USER].profile;
