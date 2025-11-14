import express from "express";
import crypto from "crypto";

const router = express.Router();

function getKey() {
  const KEY_HEX = process.env.ENCRYPTION_KEY_HEX || "";
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    console.warn("ENCRYPTION_KEY_HEX not set or wrong length (32 bytes hex). Secure endpoints will fail if used.");
    return Buffer.alloc(32);
  }
  return Buffer.from(KEY_HEX, "hex");
}

function aesGcmEncrypt(plaintext) {
  const KEY = getKey();
  const iv = crypto.randomBytes(12); // 96-bit recommended
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    ciphertext: encrypted.toString("hex")
  };
}

function aesGcmDecrypt({ ciphertext, iv, tag }) {
  const KEY = getKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(tag, "hex"));
  const dec = Buffer.concat([decipher.update(Buffer.from(ciphertext, "hex")), decipher.final()]);
  return dec.toString("utf8");
}

router.post("/encrypt", (req, res) => {
  const { text = "" } = req.body;
  if (!text) return res.status(400).json({ error: "no text" });
  const KEY = getKey();
  if (!KEY || KEY.length !== 32) return res.status(500).json({ error: "server key not configured" });

  const out = aesGcmEncrypt(text);
  return res.json(out);
});

router.post("/decrypt", (req, res) => {
  const { ciphertext, iv, tag } = req.body;
  if (!ciphertext || !iv || !tag) return res.status(400).json({ error: "missing fields" });
  const KEY = getKey();
  if (!KEY || KEY.length !== 32) return res.status(500).json({ error: "server key not configured" });

  try {
    const plaintext = aesGcmDecrypt({ ciphertext, iv, tag });
    return res.json({ plaintext });
  } catch (e) {
    return res.status(400).json({ error: "decryption failed" });
  }
});

export default router;
