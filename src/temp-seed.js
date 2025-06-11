// File: temp-seed.js
import { addUser } from "./src/services/db.js";
import { hashPw }  from "./src/services/localAuth.js";

await addUser({
  uid: "head-001",
  name: "최고관리자",
  role: "head",
  pwHash: hashPw("admin123"),
});

console.log("✅ 최고관리자 계정 생성: ID=head-001 / PW=admin123");
process.exit(0);
