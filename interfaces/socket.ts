interface Room {
  _id: string
  number: string
}

export interface RestaurantListenSocket {
  'join-merchant': (payload: {
    _id: string
  }) => void
  'join-order': (payload: Room) => void 
  'leave-order': (payload: Room) => void
  'leave': () => void
  'disconnect': () => void
}

export interface RestaurantEmitSocket {
  'update-order': () => void
}