export const helloHandler = {
  GET: (): Response => {
    return new Response('Hello, World!');
  },
};
