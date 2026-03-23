import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request, Response } from 'express';

@Injectable()
export class AuthService {
  private readonly cookieName = 'superbookmarks_auth';

  constructor(private readonly configService: ConfigService) {}

  validateCredentials(username: string, password: string): boolean {
    return (
      username === this.configService.get<string>('app.basicAuth.username') &&
      password === this.configService.get<string>('app.basicAuth.password')
    );
  }

  getRealm(): string {
    return this.configService.get<string>(
      'app.basicAuth.realm',
      'SuperBookmarks',
    );
  }

  buildLoginUrl(returnTo = '/'): string {
    const safeReturnTo =
      typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : '/';
    const encodedReturnTo = encodeURIComponent(safeReturnTo);
    return `/auth/login?returnTo=${encodedReturnTo}`;
  }

  shouldRedirectToLogin(request: Request): boolean {
    if ((request.method || 'GET').toUpperCase() !== 'GET') {
      return false;
    }

    const acceptHeader = request.headers.accept || '';
    return acceptHeader.includes('text/html');
  }

  isRequestAuthenticated(request: Request): boolean {
    const basicCredentials = this.getBasicCredentialsFromRequest(request);
    if (basicCredentials) {
      return this.validateCredentials(
        basicCredentials.username,
        basicCredentials.password,
      );
    }

    const authCookie = this.getCookieValue(request, this.cookieName);
    if (!authCookie) {
      return false;
    }

    const [username, signature] = authCookie.split('.');
    if (!username || !signature) {
      return false;
    }

    const expectedSignature = this.signSession(username);
    return this.safeCompare(signature, expectedSignature);
  }

  setAuthCookie(response: Response, username: string): void {
    response.cookie(this.cookieName, `${username}.${this.signSession(username)}`, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }

  clearAuthCookie(response: Response): void {
    response.clearCookie(this.cookieName, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
  }

  private signSession(username: string): string {
    const secret = `${this.getRealm()}::${this.configService.get<string>('app.basicAuth.password')}`;
    return createHmac('sha256', secret).update(username).digest('base64url');
  }

  private safeCompare(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }

  private getCookieValue(request: Request, cookieName: string): string {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return '';
    }

    const entries = cookieHeader.split(';');
    for (const entry of entries) {
      const [name, ...valueParts] = entry.trim().split('=');
      if (name === cookieName) {
        return decodeURIComponent(valueParts.join('='));
      }
    }

    return '';
  }

  private getBasicCredentialsFromRequest(
    request: Request,
  ): { username: string; password: string } | null {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader?.startsWith('Basic ')) {
      return null;
    }

    const encoded = authorizationHeader.slice(6);
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  }
}
