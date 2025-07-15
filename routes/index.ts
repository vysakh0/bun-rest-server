import { helloHandler } from "./hello";
import { createUser, listUsers } from "./users";

export const routes = {
  "/hello": helloHandler,
  "/api/users": {
    GET: listUsers,
    POST: createUser,
  },
};