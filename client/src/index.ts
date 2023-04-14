import { getAuth } from "./auth";
import { APIResponse } from "./types";

const ANONYMOUS_TOKEN_NAME = 'anonymousToken';


async function welcome() {
  const element= document.getElementById("hello-world");
  
  const authAPIResponse: APIResponse = await getAuth(localStorage.getItem(ANONYMOUS_TOKEN_NAME));

  console.log('------- auth response: ', authAPIResponse)

  if (element) {
    element.textContent = authAPIResponse.message;
  }

  if (authAPIResponse.isCookie == undefined && authAPIResponse.anonymousToken) {
    localStorage.setItem(ANONYMOUS_TOKEN_NAME, authAPIResponse.anonymousToken)
  }

  if (authAPIResponse.isCookie) {
    document.cookie = `${ANONYMOUS_TOKEN_NAME}=${authAPIResponse.anonymousToken}`
  }
}
welcome();