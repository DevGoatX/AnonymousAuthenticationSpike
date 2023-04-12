import axios from 'axios';

const port = process.env.PORT || 3001;

type APIResponse = {
  success: boolean,
  message: string,
  anonymouseToken: string | undefined
}

const callAPIAuth = async (anonymousToken?: string): Promise<APIResponse> => {
  console.log('------- request anonymous token: ', anonymousToken)
  const response = 
    await axios.post('http://127.0.0.1:3001/api/auth/anonymous', 
                  {}, 
                  { headers: anonymousToken ? {'Cookie': `anonymousToken=${anonymousToken}`} : {} }
    );
  console.log('------- response cookie: ', response.headers['set-cookie'])

  const cookie = response.headers['set-cookie']
  if (cookie) {
    const anonymousToken = cookie[0].split('; ')[0].split('=')[1]
    
    return {
      ...response.data,
      anonymouseToken: anonymousToken
    }
  }
  return {
    ...response.data,
    anonymouseToken: undefined
  }
}

console.log('---------- first api calling without anonymous token ------------ ')
const firstAuth = callAPIAuth()
firstAuth.then(async res => {
  console.log('---- first api response: ', res);

  console.log('---------- second api calling with anonymous token ------------ ')
  const secApiResponse = await callAPIAuth(res.anonymouseToken!!)
  console.log('---- sec api response: ', secApiResponse);
})