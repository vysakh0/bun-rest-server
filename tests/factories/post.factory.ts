import type { CreatePostRequest } from '@/type/posts';

let postCounter = 0;

export const buildPostData = (): CreatePostRequest => {
  postCounter++;
  return {
    title: `Test Post ${postCounter}`,
  };
};
