import axios from "axios";
import { serverAddress, port } from './config';
import { APIResponse } from './types';

axios.defaults.withCredentials = true;

export async function getAuth(anonymousToken: string | null | undefined): Promise<APIResponse> {

  console.log('------- request anonymous token: ', anonymousToken)
  try {
    const response = 
      await axios.post(`${serverAddress}:${port}/api/auth/anonymous`, 
                    {}, 
                    { headers: anonymousToken ? {'authorization': `${anonymousToken}`} : {} }
      );

    console.log('------ response: ', response)
    console.log('------ cookie: ', response.headers['set-cookie'])

    const apiRes: APIResponse = {
      success: response.data.success,
      message: response.data.message,
      anonymousToken: response.data.anonymousToken ? response.data.anonymousToken: null
    }

    const cookie = response.headers['set-cookie']
    if (cookie && cookie.length > 0 && cookie[0].split('; ').length > 0) {      
      const tokenName = cookie[0].split('; ')[0].split('=')[0];
      if (tokenName == 'anonymousToken') {
        apiRes.anonymousToken = cookie[0].split('; ')[0].split('=')[1];
        apiRes.isCookie = true
      }
    }

    return apiRes;
  } catch (error) {
    console.error('Error fetching anonymous token:', error);
    throw error;
  }
}