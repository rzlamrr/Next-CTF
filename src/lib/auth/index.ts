import NextAuth from 'next-auth'
export { authOptions } from './options'

import { authOptions } from './options'

const handler = NextAuth(authOptions)

export default handler
