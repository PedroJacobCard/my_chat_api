import { JwtPayloadType } from './jwtPayload';

declare module 'express' {
  export interface Request {
    user?: JwtPayloadType;
  }
}
