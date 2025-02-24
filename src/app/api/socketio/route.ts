import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponseServerIO } from '@/types/next'

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socketio',
    })
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('New client connected')

      socket.on('chat message', (msg) => {
        console.log('Message received:', msg)
        // Process the message here (e.g., call your custom API)
        // Then emit the response
        io.emit('chat message', `AI: ${msg}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected')
      })
    })
  }
  res.end()
}

export { ioHandler as GET, ioHandler as POST }
