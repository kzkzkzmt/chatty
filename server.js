const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(server, {
    cors: {
      origin: dev ? ['http://localhost:3000'] : false,
      methods: ['GET', 'POST'],
    },
  })

  // Socket.io middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    
    if (!token) {
      return next(new Error('Authentication error'))
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
      socket.data.userId = payload.userId
      socket.data.userEmail = payload.email
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  // Socket.io event handlers
  io.on('connection', (socket) => {
    console.log(`User ${socket.data.userId} connected`)

    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      console.log(`User ${socket.data.userId} joined room ${roomId}`)
    })

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId)
      console.log(`User ${socket.data.userId} left room ${roomId}`)
    })

    socket.on('send-message', (data) => {
      // Broadcast message to all users in the room except sender
      socket.to(data.roomId).emit('new-message', {
        id: data.messageId,
        content: data.content,
        userId: socket.data.userId,
        roomId: data.roomId,
        createdAt: new Date().toISOString(),
      })
    })

    socket.on('typing-start', (roomId) => {
      socket.to(roomId).emit('user-typing', {
        userId: socket.data.userId,
        isTyping: true,
      })
    })

    socket.on('typing-stop', (roomId) => {
      socket.to(roomId).emit('user-typing', {
        userId: socket.data.userId,
        isTyping: false,
      })
    })

    socket.on('file-uploaded', (data) => {
      // Notify room members about new file upload
      socket.to(data.roomId).emit('file-notification', {
        type: 'file-upload',
        fileName: data.fileName,
        version: data.version,
        userId: socket.data.userId,
        roomId: data.roomId,
      })
    })

    socket.on('disconnect', () => {
      console.log(`User ${socket.data.userId} disconnected`)
    })
  })

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})