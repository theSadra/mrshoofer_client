import jwt from "jsonwebtoken";

const ORS_API_SECRET =
  process.env.ORS_API_SECRET || "your-static-ors-api-secret";

export function verifyORSJWT(token: string) {
  try {
    const decoded = jwt.verify(token, ORS_API_SECRET);

    return decoded;
  } catch (e) {
    return null;
  }
}

export function getORSJWT() {
  // This can be used to generate the static token (run once, then use the value)
  return jwt.sign({ api: "ORS" }, ORS_API_SECRET, { expiresIn: "10y" });
}
