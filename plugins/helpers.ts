import { Client, ReverseGeocodeResponse, GeocodeResult } from '@googlemaps/google-maps-services-js'

import { ObjectId } from "mongodb";
import { getOrderCount } from "../connectors/orders/get-count";
import { Address } from '../interfaces/general';
import { Order } from "../interfaces/order";

const months: string[] = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

export async function generateOrderNumber(_id: ObjectId, type: Order['type']): Promise<string> {
  const date: Date = new Date()
  let str: string = ''
  switch (type) {
    case 'pre-order':
      str = 'PRE'
      break
    case 'booking':
      str = 'BKG'
      break
    case 'dine-in':
      str = 'DIN'
      break
  }

  const count: number = await getOrderCount(type, _id)

  str += `${date.getFullYear()}/${months[date.getMonth()]}/${(count + 1).toString().padStart(5, '0')}`
  return str
}

export function generateRandomString(length: number = 5): string {
  let str: string = ''
  const availableChars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let i = 0; i < length; i++) {
    str += availableChars[Math.round(Math.random() * (availableChars.length - 1))]
    if (i === length - 1) return str
  }
}

export async function verifyAddress(address: Address): Promise<Address> {
  const client: Client = new Client({})

  const result: ReverseGeocodeResponse = await client.reverseGeocode({
    params: {
      latlng: {
        lat: address.position.coordinates[1],
        lng: address.position.coordinates[0]
      },
      key: process.env.GOOGLE_KEY
    },
    baseURL: process.env.BASE_URL
  })
  if (result.data.status === 'OK') {
    const data: GeocodeResult = result.data.results[0]
    address.formatted_address = data.formatted_address.split(', ').reverse()
  } else throw new Error('INVALID_ADDRESS')

  return address
}