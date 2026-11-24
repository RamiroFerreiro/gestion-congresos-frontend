export interface UserProfileResponse {
  userId: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: number;
  country: string;
  enabled: boolean;
}

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  dni: number;
  country: string;
}
