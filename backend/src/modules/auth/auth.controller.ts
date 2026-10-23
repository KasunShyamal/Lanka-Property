import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (Buyer, Seller, Agent)' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return JWT bearer token' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('google')
  @ApiOperation({ summary: 'Sign in or register with Google OAuth credentials' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated with Google' })
  async googleLogin(@Body() body: any) {
    return this.authService.googleLogin(body);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getProfile(@Req() req: any) {
    return req.user;
  }
}
