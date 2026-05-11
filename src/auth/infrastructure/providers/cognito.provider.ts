import { AuthFlowType, CodeMismatchException, CognitoIdentityProviderClient, ConfirmForgotPasswordCommand, ConfirmSignUpCommand, ExpiredCodeException, ForgotPasswordCommand, InitiateAuthCommand, InvalidPasswordException, NotAuthorizedException, ResendConfirmationCodeCommand, SignUpCommand, UsernameExistsException, UserNotConfirmedException, UserNotFoundException } from "@aws-sdk/client-cognito-identity-provider";
import { AuthTokens, IAuthProvider, SignInParams, SignUpParams } from "../../domain/interfaces/auth.provider.interface";
import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "crypto";

@Injectable()
export class CognitoProvider implements IAuthProvider {

  private readonly client: CognitoIdentityProviderClient;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly logger = new Logger(CognitoProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new CognitoIdentityProviderClient({
      region: configService.getOrThrow<string>('COGNITO_REGION')
    });
    this.clientId = configService.getOrThrow<string>('COGNITO_CLIENT_ID');
    this.clientSecret = configService.getOrThrow<string>('COGNITO_CLIENT_SECRET')
  }

  async signIn({ email, password }: SignInParams): Promise<AuthTokens> {
    try {
      const { AuthenticationResult } = await this.client.send(
        new InitiateAuthCommand({
          AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
          ClientId: this.clientId,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
            SECRET_HASH: this.calculateSecretHash(email),
          },
        }),
      );

      if (!AuthenticationResult) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      if (!AuthenticationResult.AccessToken || !AuthenticationResult.IdToken || !AuthenticationResult.RefreshToken || !AuthenticationResult.ExpiresIn) {
        throw new UnauthorizedException('Sem retorno dos dados');
      }

      return {
        access_token: AuthenticationResult?.AccessToken,
        id_token: AuthenticationResult.IdToken,
        refresh_token: AuthenticationResult.RefreshToken,
        expires_in: AuthenticationResult.ExpiresIn,
      };
    } catch (error) {
      this.mapCognitoError(error);
    }
  }

  async signUp({ email, last_name, name, password }: SignUpParams): Promise<{ userSub: string; }> {
    try {

      const { UserSub } = await this.client.send(
        new SignUpCommand({
          ClientId: this.clientId,
          Username: email,
          Password: password,
          SecretHash: this.calculateSecretHash(email),
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'given_name', Value: name },
            { Name: 'family_name', Value: last_name }
          ]
        })
      )

      if (!UserSub) {
        throw new UnauthorizedException('Dado não retornado')
      }

      return { userSub: UserSub }
    } catch (e) {
      this.mapCognitoError(e)
    }
  }


  async confirmEmail(email: string, code: string): Promise<void> {
    try {

      await this.client.send(
        new ConfirmSignUpCommand({
          ClientId: this.clientId,
          Username: email,
          ConfirmationCode: code,
          SecretHash: this.calculateSecretHash(email)
        })
      )

    } catch (e) {
      this.mapCognitoError(e)
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {

      await this.client.send(
        new ForgotPasswordCommand({
          ClientId: this.clientId,
          Username: email,
          SecretHash: this.calculateSecretHash(email)
        })
      )
    } catch (e) {
      this.mapCognitoError(e)
    }
  }


  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    try {

      await this.client.send(
        new ConfirmForgotPasswordCommand({
          ClientId: this.clientId,
          Username: email,
          ConfirmationCode: code,
          Password: newPassword,
          SecretHash: this.calculateSecretHash(email)
        })
      )
    } catch (e) {
      this.mapCognitoError(e)
    }
  }


  async resendConfirmationCode(email: string): Promise<void> {
    try {

      await this.client.send(
        new ResendConfirmationCodeCommand({
          ClientId: this.clientId,
          Username: email,
          SecretHash: this.calculateSecretHash(email)
        })
      )
    } catch (e) {
      this.mapCognitoError(e)
    }
  }


  async refreshToken(token: string, email: string): Promise<AuthTokens> {
    try {

      const { AuthenticationResult } = await this.client.send(
        new InitiateAuthCommand({
          AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
          ClientId: this.clientId,
          AuthParameters: {
            REFRESH_TOKEN: token,
            USERNAME: email,
            SECRET_HASH: this.calculateSecretHash(email)
          }
        })
      )

      if (!AuthenticationResult) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      if (!AuthenticationResult.AccessToken || !AuthenticationResult.IdToken || !AuthenticationResult.RefreshToken || !AuthenticationResult.ExpiresIn) {
        throw new UnauthorizedException('Sem retorno dos dados');
      }

      return {
        access_token: AuthenticationResult.AccessToken,
        expires_in: AuthenticationResult.ExpiresIn,
        id_token: AuthenticationResult.IdToken,
        refresh_token: AuthenticationResult.RefreshToken
      }
    } catch (e) {
      this.mapCognitoError(e)
    }
  }




  private calculateSecretHash(username: string): string {
    return createHmac('SHA256', this.clientSecret)
      .update(username + this.clientId)
      .digest('base64');
  }

  private mapCognitoError(error: unknown): never {
    this.logger.error('Cognito error', error);

    if (error instanceof NotAuthorizedException) {
      throw new UnauthorizedException('Email ou senha inválidos')
    }

    if (error instanceof UserNotFoundException) {
      throw new UnauthorizedException('Email ou senha inválidos')
    }

    if (error instanceof UsernameExistsException) {
      throw new ConflictException('Email já cadastrado')
    }

    if (error instanceof InvalidPasswordException) {
      throw new BadRequestException(error.message)
    }

    if (error instanceof UserNotConfirmedException) {
      throw new UnauthorizedException('Email não confirmado. Verifque sua caixa de entrada')
    }

    if (error instanceof CodeMismatchException) {
      throw new BadRequestException('Código de verificação inválido')
    }

    if (error instanceof ExpiredCodeException) {
      throw new BadRequestException('Código de verificação expirado')
    }

    throw error
  }



}