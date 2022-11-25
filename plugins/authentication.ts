import { Request } from "express";
import { EventAction } from "../interfaces/event";

export async function verifyAction(user: Request['user'], action: EventAction): Promise<boolean> {
  return true
}