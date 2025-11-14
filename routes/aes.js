import express from "express";
import crypto from "crypto";

const router = express.Router();

function getKey() {
  const KEY_HEX = process.env.ENCRYPTION_KEY_HEX || "";
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    return Buffer.alloc(32);
  }
  return Buffer.from(KEY_HEX, "hex");
}

const algorithm = "aes-256-ctr"; // fast and secure


router.post("/encrypt", (req, res) => {
  const { text = "" } = req.body;
  if (!text || typeof text !== "string") return res.status(400).json({ error: "text must be string" });
  const key = getKey();

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);

  res.json({
    iv: iv.toString("hex"),
    content: encrypted.toString("hex")
  });
});

router.post("/decrypt", (req, res) => {
  const { iv, content } = req.body;
  if (!iv || !content) return res.status(400).json({ error: "iv and content required" });

  try {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(content, "hex")),
      decipher.final()
    ]);

    res.json({ plaintext: decrypted.toString("utf8") });
  } catch (err) {
    res.status(400).json({ error: "Decryption failed. Check your key/iv/content." });
  }
});

export default router;
