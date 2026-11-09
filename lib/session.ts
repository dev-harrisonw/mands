import { cookies } from "next/headers";
import { getState } from "./store";

export async function getSession() {
  const state = getState();
  const tasterId = (await cookies()).get("tasterId")?.value ?? null;
  const taster = state.people.find((person) => person.id === tasterId) ?? null;
  return { state, taster };
}
