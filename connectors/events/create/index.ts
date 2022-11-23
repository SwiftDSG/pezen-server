import { InsertOneResult, ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { EventBase, Event } from "../../../interfaces/event";

export async function createEvent(data: EventBase): Promise<InsertOneResult> {
  const payload: Event = {
    ...data,
    _id: new ObjectId()
  }
  const result: InsertOneResult = await collections.events.insertOne(payload)
  return result
}