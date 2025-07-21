import { HTTP_STATUS } from '@constants/http';

import { createdResponse, errorResponse, successResponse } from '@utils/response';

import type { AsyncHandler } from '@type/handlers';
import type { CreatePostRequest } from '@type/posts';

import { getUserId } from '@middlewares/auth';

import { postQueries } from '@queries/posts';

export const createPost: AsyncHandler = async (req) => {
  const userId = getUserId(req);

  const body = (await req.json()) as CreatePostRequest;

  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    return errorResponse('Title is required', HTTP_STATUS.BAD_REQUEST);
  }

  const result = await postQueries.create({
    title: body.title.trim(),
    userId,
  });

  const [newPost] = result;

  if (!newPost) {
    return errorResponse('Failed to create post', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  // Convert snake_case to camelCase for response
  const postResponse = {
    id: newPost.id,
    title: newPost.title,
    createdAt: newPost.created_at,
    updatedAt: newPost.updated_at,
  };

  return createdResponse(postResponse);
};

export const getUserPosts: AsyncHandler = async (req) => {
  const userId = getUserId(req);
  if (!userId) {
    return errorResponse('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
  }

  const userPosts = await postQueries.findByUserId(userId);

  return successResponse(userPosts);
};

export const getAllPosts: AsyncHandler = async () => {
  const allPosts = await postQueries.findAll();

  return successResponse(allPosts);
};
