import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export function createSwaggerBasicAuthMiddleware(authService: AuthService) {
  return (request: Request, response: Response, next: NextFunction) => {
    const authorizationHeader = request.headers.authorization;
    const unauthorizedResponse = () => {
      response.setHeader(
        'WWW-Authenticate',
        `Basic realm="${authService.getRealm()}"`,
      );
      response.status(401).send('Authentication required.');
    };

    if (!authorizationHeader?.startsWith('Basic ')) {
      unauthorizedResponse();
      return;
    }

    const encoded = authorizationHeader.slice(6);
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');

    if (separatorIndex === -1) {
      unauthorizedResponse();
      return;
    }

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    if (!authService.validateCredentials(username, password)) {
      unauthorizedResponse();
      return;
    }

    next();
  };
}
