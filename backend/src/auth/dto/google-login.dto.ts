import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  /** ID Token (JWT) emitido pelo Google Identity Services no frontend. */
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
