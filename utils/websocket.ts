import WebSocket from 'isomorphic-ws'

export const createWebSocket = (url: string) => {
  return new WebSocket(url)
} 