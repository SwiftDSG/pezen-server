import { collections } from "../../../plugins/connections";
import { Branch } from "../../../interfaces/branch";

export async function findBranchesByQuery(query: any): Promise<Branch[]> {
  const result: Branch[] = (await collections.branches.find(query).toArray()) as Branch[]
  return result
}