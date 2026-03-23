import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	Render,
	Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';
import { LoginDto } from '../DTOs/auth/login.dto';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';

@ApiExcludeController()
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Get('login')
	@Render('pages/login')
	renderLoginPage(@Query('returnTo') returnTo?: string) {
		const safeReturnTo =
			typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : '/';

		return {
			title: 'Login',
			appName: 'SuperBookmarks',
			theme: 'dark',
			returnTo: safeReturnTo,
		};
	}

	@Public()
	@Post('login')
	login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
		const isValid = this.authService.validateCredentials(
			loginDto.username,
			loginDto.password,
		);

		if (!isValid) {
			response.status(401);
			return { message: 'Invalid credentials.' };
		}

		this.authService.setAuthCookie(response, loginDto.username);

		return {
			success: true,
			returnTo:
				typeof loginDto.returnTo === 'string' && loginDto.returnTo.startsWith('/')
					? loginDto.returnTo
					: '/',
		};
	}

	@Public()
	@Get('logout')
	logout(@Res() response: Response) {
		this.authService.clearAuthCookie(response);
		response.redirect('/auth/login');
	}
}
