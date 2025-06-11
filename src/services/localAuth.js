import CryptoJS from "crypto-js";
import { getUser, addUser } from "./db";

const STORAGE_KEY = "tbm_current_user";

export const hashPw = (pw) =>
  CryptoJS.SHA256(pw).toString(CryptoJS.enc.Hex);

export async function login(uid, pw) {
  const u = await getUser(uid);
  if (!u) return false;
  if (u.pwHash !== hashPw(pw)) return false;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  return true;
}

export function currentUser() {
  const s = sessionStorage.getItem(STORAGE_KEY);
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export function logout() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export async function changePassword(oldPw, newPw) {
  const cu = currentUser();
  if (!cu) return false;
  const u = await getUser(cu.uid);
  if (!u) return false;
  if (u.pwHash !== hashPw(oldPw)) return false;
  u.pwHash = hashPw(newPw);
  u.resetRequired = false;
  await addUser(u);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  return true;
}
