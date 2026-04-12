import { createClerkClient } from "@clerk/backend";
import { env } from "env";

const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY
})

async function getUserId(request){

  const { isAuthenticated, userId} = request.auth

  if(!isAuthenticated){
    return null
  }

  const user = await clerkClient.users.getUser(userId)

  return user

}