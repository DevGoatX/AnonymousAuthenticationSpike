export interface USERITEM {
  name: string,
  locale: string,
  id: string,
  typeName: string
}

export interface PAYLOAD {
  anonymousUserId: string,
  iat?: number
}

export interface APIResponse {
  success: boolean,
  message: string,
  anonymousToken: string | undefined
}