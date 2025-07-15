export const helloHandler = {
  GET: (req: Request) => {
    return new Response("Hello, World!");
  },
};
