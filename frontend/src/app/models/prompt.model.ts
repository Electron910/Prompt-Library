export interface Tag {
  id: number;
  name: string;
}

export interface Prompt {
  id: number;
  title: string;
  content: string;
  complexity: number;
  tags: Tag[];
  created_at: string;
  view_count: number;
}

export interface CreatePromptPayload {
  title: string;
  content: string;
  complexity: number;
  tags: string[];
}

export interface ApiError {
  error?: string;
  errors?: Record<string, string>;
}

export interface AuthUser {
  id: number;
  username: string;
}

export interface AuthState {
  authenticated: boolean;
  user: AuthUser | null;
}