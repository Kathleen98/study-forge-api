import { AuthFlowType, CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { AuthTokens, IAuthProvider, SignInParams, SignUpParams } from "../domain/interfaces/auth.provider.interface";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "crypto";

@Injectable()
export class CognitoProvider implements IAuthProvider{

  private readonly client : CognitoIdentityProviderClient;
  private readonly clientId: string;
  private readonly clientSecret : string;
  private readonly logger = new Logger(CognitoProvider.name);

  constructor(private readonly configService : ConfigService){
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

      return {
        access_token: AuthenticationResult.AccessToken,
        id_token: AuthenticationResult.IdToken,
        refresh_token: AuthenticationResult.RefreshToken,
        expires_in: AuthenticationResult.ExpiresIn,
      };
    } catch (error) {
      this.mapCognitoError(error);
    }
  }

  signUp(params: SignUpParams): Promise<{ userSub: string; }> {
    
  }


  confirmEmail(email: string, code: string): Promise<void> {
    
  }

   forgotPassword(email: string): Promise<void> {
    
  }


  confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    
  }


  resendConfirmationCode(email: string): Promise<void> {
    
  }


  refreshToken(refreshToken: string, email: string): Promise<AuthTokens> {
    
  }


 

  private calculateSecretHash(username : string) : string{
    return createHmac('SHA256', this.clientSecret)
      .update(username + this.clientId)
      .digest('base64'); 
  }

  private mapCognitoError(error: unknown): never{
    this.logger.error('Cognito error', error)

     throw error
  }

 

}