// reverse classical ciphers
import express from "express";
const router = express.Router();

function atbashReverse(text) {
  // Atbash is symmetric, same transform works
  const a = "abcdefghijklmnopqrstuvwxyz";
  const rev = a.split("").reverse().join("");
  return text.split("").map(ch => {
    const lower = ch.toLowerCase();
    const idx = rev.indexOf(lower);
    if (idx === -1) return ch;
    const mapped = a[idx];
    return (ch === lower) ? mapped : mapped.toUpperCase();
  }).join("");
}

function caesarReverse(text, shift) {
  shift = Number(shift) || 0;
  return text.split("").map(ch => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
    }
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
    }
    return ch;
  }).join("");
}

router.post("/", (req, res) => {
  const { text = "", cipher = "atbash-caesar", shift = 3, caseMode } = req.body;

  if (typeof text !== "string") return res.status(400).json({ error: "text must be string" });

  let out = text;

  if (cipher === "atbash") {
    out = atbashReverse(out);
  } else if (cipher === "caesar") {
    out = caesarReverse(out, shift);
  } else if (cipher === "atbash-caesar") {
    // reverse order: undo caesar then atbash
    out = caesarReverse(out, shift);
    out = atbashReverse(out);
  }

  if (caseMode === "upper") out = out.toUpperCase();
  if (caseMode === "lower") out = out.toLowerCase();

  return res.json({ plaintext: out });
});

export default router;
