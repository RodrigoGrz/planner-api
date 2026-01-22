export interface SendMailParams {
  to: {
    name?: string | null
    address: string
  }
  subject: string
  html: string
}

export interface Mailer {
  send(params: SendMailParams): Promise<void>
}
