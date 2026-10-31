import { createClient } from 'next-sanity'
import { projectId, dataset, apiVersion } from '../../../sanity/env'

// Reads send a token so the dataset can go private later (that needs a paid
// Sanity plan). Neither variable is NEXT_PUBLIC, so the token never ships to
// the browser. SANITY_READ_TOKEN is a Viewer token; the write token is a fallback.
const readToken = process.env.SANITY_READ_TOKEN ?? process.env.SANITY_WRITE_TOKEN

export const client = createClient({ projectId, dataset, apiVersion, useCdn: true, token: readToken })

export const writeClient = createClient({
  projectId, dataset, apiVersion, useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})
