import { Client, Account, Databases, ID } from "appwrite";

export const APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID = "6a848cdb001bfd2d59a9";
export const APPWRITE_DATABASE_ID = "6a858e86001a384c7913";

const client = new Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export { ID };
export default client;
