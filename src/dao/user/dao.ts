import { GET } from '@utils/index';

export const phoneLogin = (phone: string, password: string) => {
  return GET('/login/cellphone', {
    phone,
    password,
  });
};

export const emailLogin = (email: string, password: string) => {
  return GET('/login', {
    email,
    password,
  });
};

export const login = (account: string, password: string) => {
  const emailFlag = '@';
  if (account.includes(emailFlag)) {
    return emailLogin(account, password);
  }
  return phoneLogin(account, password);
};
