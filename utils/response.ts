export const jsonResponse = (data: unknown, status = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const errorResponse = (message: string, status = 400): Response => {
  return jsonResponse({ error: message }, status);
};

export const successResponse = (data: unknown, status = 200): Response => {
  return jsonResponse(data, status);
};

export const createdResponse = (data: unknown): Response => {
  return jsonResponse(data, 201);
};
