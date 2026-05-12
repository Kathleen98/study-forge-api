import { IsEmail, IsString, MinLength } from "class-validator";

export class SignInDto {
    @IsEmail({}, { message: 'O email deve ser válido' })
    email!: string ;
    
    @IsString()
    @MinLength(6, { message: 'A senha deve conter no mínimo 6 caracteres' })
    password!: string;

}