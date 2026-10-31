import { createClient } from 'next-sanity'
import { projectId, dataset, apiVersion } from '../../../sanity/env'

// The dataset is private (submissions hold submitter emails), so reads need a
// token. Neither variable is NEXT_PUBLIC, so the token never ships to the
// browser. SANITY_READ_TOKEN is a Viewer token; the write token is a fallback.
const readToken = process.env.SANITY_READ_TOKEN ?? process.env.SANITY_WRITE_TOKEN

export const client = createClient({ projectId, dataset, apiVersion, useCdn: true, token: readToken })

export const writeClient = createClient({
  projectId, dataset, apiVersion, useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})
