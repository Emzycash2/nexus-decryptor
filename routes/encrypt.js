// server-side classical ciphers: atbash, caesar, atbash-caesar
import express from "express";
const router = express.Router();

function atbashTransform(text) {
  const a = "abcdefghijklmnopqrstuvwxyz";
  const rev = a.split("").reverse().join("");
  return text.split("").map(ch => {
    const lower = ch.toLowerCase();
    const idx = a.indexOf(lower);
    if (idx === -1) return ch;
    const mapped = rev[idx];
    return (ch === lower) ? mapped : mapped.toUpperCase();
  }).join("");
}

function caesarTransform(text, shift) {
  shift = Number(shift) || 0;
  return text.split("").map(ch => {
    const code = ch.charCodeAt(0);
    // uppercase
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
    }
    // lowercase
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
    }
    return ch;
  }).join("");
}

router.post("/", (req, res) => {
  const { text = "", cipher = "atbash-caesar", shift = 3, caseMode } = req.body;

  if (typeof text !== "string") return res.status(400).json({ error: "text must be string" });

  let out = text;

  if (cipher === "atbash") {
    out = atbashTransform(out);
  } else if (cipher === "caesar") {
    out = caesarTransform(out, shift);
  } else if (cipher === "atbash-caesar") {
    out = atbashTransform(out);
    out = caesarTransform(out, shift);
  } else {
    // unknown cipher: fallback to plain echo
  }

  if (caseMode === "upper") out = out.toUpperCase();
  if (caseMode === "lower") out = out.toLowerCase();

  return res.json({ ciphertext: out });
});

export default router;
