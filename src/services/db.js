import CryptoJS from "crypto-js";
import { openDB } from "idb";

const DB_NAME    = "tbm-app";
const DB_VERSION = 12;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  async upgrade(db, oldV, newV, tx) {
    if (!db.objectStoreNames.contains("users")) {
      const s = db.createObjectStore("users", { keyPath: "uid" });
      s.createIndex("role", "role");
    }
    const usersStore = tx.objectStore("users");
    if (!(await usersStore.get("head-001"))) {
      await usersStore.put({
        uid:  "head-001",
        name: "최고관리자",
        role: "head",
        pwHash: CryptoJS.SHA256("admin123").toString(CryptoJS.enc.Hex),
        resetRequired: false,
      });
    }

    if (!db.objectStoreNames.contains("notices")) {
      const n = db.createObjectStore("notices", { keyPath: "id" });
      n.createIndex("level",     "level");
      n.createIndex("siteId",    "siteId");
      n.createIndex("partnerId", "partnerId");
      n.createIndex("createdAt", "createdAt");
    }
    if (!db.objectStoreNames.contains("acks")) {
      const a = db.createObjectStore("acks", { keyPath: "id" });
      a.createIndex("noticeId",  "noticeId");
      a.createIndex("siteId",    "siteId");
      a.createIndex("partnerId", "partnerId");
    }
    if (!db.objectStoreNames.contains("tbms")) {
      const t = db.createObjectStore("tbms", { keyPath: "id" });
      t.createIndex("date",      "date");
      t.createIndex("siteId",    "siteId");
      t.createIndex("partnerId", "partnerId");
    }
  }
});

/* users */
export const addUser             = async (u) => (await dbPromise).put("users", u);
export const getUser             = async (id) => (await dbPromise).get("users", id);
export const getByRole           = async (r)  => (await dbPromise).getAllFromIndex("users","role",r);
export const userExists          = async (uid) => !!(await getUser(uid));
export const makeUniqueUid       = async (base) => {
  let uid = base, i = 1;
  while (await userExists(uid)) uid = `${base}-${i++}`;
  return uid;
};
export const deleteUserCascade   = async (uid) => {
  const db = await dbPromise;
  await db.delete("users", uid);
  const allNot = await db.getAll("notices");
  await Promise.all(
    allNot
      .filter((n) => n.siteId === uid || n.partnerId === uid)
      .map((n) => db.delete("notices", n.id))
  );
};

/* notices */
export const saveNotice    = async (n) => (await dbPromise).put("notices", n);
export const deleteNotice  = async (id) => (await dbPromise).delete("notices", id);
export const fetchBoardNotices = async ({ siteId = null, partnerId = null }) => {
  const all = await (await dbPromise).getAll("notices");
  return all
    .filter((n) => {
      if (n.level === "head")    return true;
      if (n.level === "site")    return n.siteId === siteId;
      if (n.level === "partner") return n.partnerId === partnerId;
      return false;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
};

/* acks */
export const addAck      = async (ack) => (await dbPromise).put("acks", ack);
export const getAck      = async (noticeId, partnerId) =>
  (await dbPromise).get("acks", `${noticeId}_${partnerId}`);

/* tbms index 사용 예시 (필요 시) */
// export const getAcksBySite = async (siteId) =>
//   (await dbPromise).getAllFromIndex("acks", "siteId", siteId);
