import { InsertOneResult, ObjectId } from "mongodb";
import { createEvent } from "../connectors/events/create";
import { EventBase } from "../interfaces/event";

export async function addEvent(data: EventBase): Promise<ObjectId> {
  if (data.type === 'action') {
    if (!data.action || typeof data.action !== 'string') throw new Error('EVENT_MUST_HAVE_VALID_ACTION')
    if (!data.user) throw new Error('EVENT_MUST_HAVE_VALID_USER')
  } else if (data.type === 'system') {
    if (!data.action || typeof data.action !== 'string') throw new Error('EVENT_MUST_HAVE_VALID_ACTION')
  } else if (data.type === 'error') {
    if (!data.error_message || typeof data.error_message !== 'string') throw new Error('EVENT_MUST_HAVE_VALID_ERROR_MESSAGE')
    if (!data.error_stack) throw new Error('EVENT_MUST_HAVE_VALID_ERROR_STACK')
  }
  const { insertedId: newEventId }: InsertOneResult = await createEvent(data)
  return newEventId
}