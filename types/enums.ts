/**
 * Enum for different user roles in the system
 */
export enum UserRole {
  RESTAURANT = "restaurant",
  ADMIN = "admin",
  STAFF = "staff",
}

/**
 * Enum for different staff types under a restaurant
 */
export enum StaffRole {
  KITCHEN = "kitchen_staff",
  WAITER_DESK = "waiter_desk_staff",
}

/**
 * Enum for account status
 */
export enum AccountStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_VERIFICATION = "pending_verification",
}

/**
 * Enum for OTP types
 */
export enum OTPType {
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_RESET = "password_reset",
  LOGIN_VERIFICATION = "login_verification",
}

/**
 * Enum for token types
 */
export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
}

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export enum CategoryStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}
