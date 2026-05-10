export interface AuthTokens{
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface SignInParams{
  email: string;
  password: string;
}

export interface SignUpParams{
  email: string;
  password: string;
  name: string;
  last_name: string;
}

export const AUTH_PROVIDER = 'AUTH_PROVIDER';

export interface IAuthProvider{
  signIn(params: SignInParams): Promise<AuthTokens>;
  signUp(params: SignUpParams): Promise<{userSub: string}>;
  confirmEmail(email: string, code : string) : Promise<void>;
  resendConfirmationCode(email: string): Promise<void>;
  refreshToken(refreshToken : string, email: string): Promise<AuthTokens>;
  forgotPassword(email: string): Promise<void>;
  confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void>
}