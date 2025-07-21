export interface CreatePostRequest {
  title: string;
}

export interface Post {
  id: number;
  title: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export type PostResponse = Omit<Post, 'user_id'> & {
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export type UserPostsResponse = PostResponse[];

// Types for database operations
export type InsertPost = Omit<Post, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePost = Partial<Omit<Post, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
