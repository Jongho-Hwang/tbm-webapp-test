/* functions/index.js */
const functions = require("firebase-functions");
const admin     = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();               // 짧게 쓰려고 별칭

// ────────── 사용자 문서 생성 (Head 전용) ──────────
exports.addUserDoc = functions
  .region("asia-northeast3")
  .https.onCall(async (data /* { uid,name,role,siteId,partnerId,pwHash,resetRequired } */) => {
    await db.doc(`users/${data.uid}`).set(data);
    return { ok: true };
  });

// ────────── 공지 저장 / 삭제 ──────────
exports.saveNotice = functions
  .region("asia-northeast3")
  .https.onCall(async (data /* notice 객체 */) => {
    await db.doc(`notices/${data.id}`).set(data);
    return { ok: true };
  });

exports.deleteNotice = functions
  .region("asia-northeast3")
  .https.onCall(async ({ id }) => {
    await db.doc(`notices/${id}`).delete();
    return { ok: true };
  });

// ────────── TBM 기록 추가 / 수정 ──────────
exports.saveTbm = functions
  .region("asia-northeast3")
  .https.onCall(async (data /* tbm 객체 */) => {
    await db.collection("tbms").add(data);
    return { ok: true };
  });

exports.updateTbm = functions
  .region("asia-northeast3")
  .https.onCall(async ({ id, data }) => {
    await db.doc(`tbms/${id}`).update(data);
    return { ok: true };
  });
