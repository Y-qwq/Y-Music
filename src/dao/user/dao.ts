import { IRequire } from '@/utils/ts';
import { GET } from '@utils/index';

export const phoneLogin: IRequire = (phone: string, password: string) => {
  return GET('/login/cellphone', {
    phone,
    password,
  });
};

export const emailLogin: IRequire = (email: string, password: string) => {
  return GET('/login', {
    email,
    password,
  });
};

export const login: IRequire = (account: string, password: string) => {
  const emailFlag = '@';
  if (account.includes(emailFlag)) {
    return emailLogin(account, password);
  }
  return phoneLogin(account, password);
};
