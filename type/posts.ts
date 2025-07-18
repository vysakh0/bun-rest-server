import type { Post } from '@db/schema/posts';

export interface CreatePostRequest {
  title: string;
}

export type PostResponse = Omit<Post, 'userId'> & {
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export type UserPostsResponse = PostResponse[];
