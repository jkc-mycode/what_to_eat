export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Error Response DTO
export interface ErrorResponseDTO {
  success: false;
  message: string;
  error?: string;
}
