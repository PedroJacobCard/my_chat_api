export type JwtPayloadType = {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
};
