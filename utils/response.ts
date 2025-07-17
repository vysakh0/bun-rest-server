import { HTTP_STATUS, type HttpStatus } from '@constants/http';

export const jsonResponse = (data: unknown, status: HttpStatus = HTTP_STATUS.OK): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const errorResponse = (
  message: string,
  status: HttpStatus = HTTP_STATUS.BAD_REQUEST
): Response => {
  return jsonResponse({ error: message }, status);
};

export const successResponse = (data: unknown, status: HttpStatus = HTTP_STATUS.OK): Response => {
  return jsonResponse(data, status);
};

export const createdResponse = (data: unknown): Response => {
  return jsonResponse(data, HTTP_STATUS.CREATED);
};
