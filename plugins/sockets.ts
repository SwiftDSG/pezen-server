import { Server as HTTPServer } from 'http'
import { Namespace, Server, Socket } from "socket.io";

import { RestaurantListenSocket, RestaurantEmitSocket } from '../interfaces/socket';

const clients: {
  [k: string]: {
    [k: string]: string
  }
} = {}

export function initSocket(server: HTTPServer, allowed_url: string[] = []): void {
  const io: Server = new Server(server, {
    cors: {
      origin: allowed_url
    }
  })

  const restaurantNSP: Namespace<RestaurantListenSocket, RestaurantEmitSocket> = io.of('/restaurant')
  
  restaurantNSP.on('connection', (socket) => {
    let merchantRoom: string = ''
    let orderRoom: string = ''

    socket.on('join-merchant', (payload) => {
      merchantRoom = payload._id
      socket.join(merchantRoom)
    })
    socket.on('join-order', (payload) => {
      if (allowed_url.includes(socket.request?.headers?.origin) && payload?._id && payload.number) {
        if (clients?.[payload._id]?.[payload.number] !== socket.id) {
          clients[payload._id] = clients[payload._id] || {}
          clients[payload._id][payload.number] = socket.id
          orderRoom = payload._id
          socket.join(orderRoom)
        }
      }
    })
    socket.on('leave-order', (payload) => {
      if (payload._id && payload.number) {
        if (clients[payload._id]) delete clients[payload._id][payload.number]
        if (!Object.keys(clients[payload._id]).length) delete clients[payload._id]
        orderRoom = ''
        socket.leave(payload._id)
      }
    })
    socket.on('leave', () => {
      if (orderRoom) {
        const keys: string[] = Object.keys(clients[orderRoom])
        if (keys.length) {
          const key: string = keys.find(a => clients[orderRoom][a] === socket.id)
          delete clients[orderRoom][key]
        } else {
          delete clients[orderRoom]
        }
        socket.leave(orderRoom)
        orderRoom = ''
      } else if (merchantRoom) {
        socket.leave(merchantRoom)
        merchantRoom = ''
      }
    })
    socket.on('disconnect', () => {
      if (orderRoom) {
        const keys: string[] = Object.keys(clients[orderRoom])
        if (keys.length) {
          const key: string = keys.find(a => clients[orderRoom][a] === socket.id)
          delete clients[orderRoom][key]
        } else {
          delete clients[orderRoom]
        }
        socket.leave(orderRoom)
        orderRoom = ''
      } else if (merchantRoom) {
        socket.leave(merchantRoom)
        merchantRoom = ''
      }
    })
  })

}