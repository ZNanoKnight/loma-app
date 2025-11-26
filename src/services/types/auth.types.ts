/**
 * Authentication Types
 * Types for authentication and user session management
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  userData: {
    firstName: string;
    lastName: string;
    age: string;
    weight: string;
    heightFeet: string;
    heightInches: string;
    gender: string;
    activityLevel: string;
    goals: string[];
    dietaryPreferences: string[];
    allergens: string[];
    equipment: string;
    cookingFrequency: string;
  };
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpResponse {
  session: AuthSession;
  requiresEmailVerification: boolean;
}

export interface SignInResponse {
  session: AuthSession;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}
