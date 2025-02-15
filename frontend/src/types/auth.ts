export interface User {
    id: string;
    email: string;
    username: string;
    role: 'admin' | 'user' | 'guest';
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface LoginForm {
    username: string;
    password: string;
  }
  
  export interface RegisterForm {
    email: string;
    username: string;
    password: string;
  }
  
  export interface Token {
    access_token: string;
    token_type: string;
    expires_at: string;
  }