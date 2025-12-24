import { MastraClient } from '@mastra/client-js'

const MASTRA_BASE_URL = 'http://localhost:6700'

// Create a singleton Mastra client instance
export const mastraClient = new MastraClient({
  baseUrl: MASTRA_BASE_URL,
})

// Get the agent instance for chat
export function getChatAgent() {
  return mastraClient.getAgent('summaryAgent')
}

// Export the base URL for any custom fetch calls
export { MASTRA_BASE_URL }
