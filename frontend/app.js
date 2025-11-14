/* ---------------------------
   VARIABLES
----------------------------*/
const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const copyBtn = document.getElementById("copy");
const cipherEl = document.getElementById("cipher");
const shiftEl = document.getElementById("shift");
const caseSwitchEl = document.getElementById("case-switch");
const charCountEl = document.getElementById("charCount");
const strengthEl = document.getElementById("strength");
const historyEl = document.getElementById("history");
const clearHistoryBtn = document.getElementById("clearHistory");
const keyboardToggle = document.getElementById("keyboardToggle");
const keyboardModal = document.getElementById("keyboardModal");
const keyboardModalInner = document.getElementById("keyboardModalInner");
const modalInput = document.getElementById("modalInput");
const submitBtn = document.getElementById("submitBtn");
const closeBtn = document.getElementById("closeBtn");
const keyboard = document.getElementById("keyboard");


/* ---------------------------
   BACKEND TRANSFORM
----------------------------*/
async function transformBackend(text, cipher, shift, op, caseMode) {
    if (!text) return "";

    const backend = "http://localhost:5000";
    const endpoint = op === "encode" ? `${backend}/api/encrypt` : `${backend}/api/decrypt`;

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, cipher, shift, caseMode })
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        return op === "encode" ? data.ciphertext : data.plaintext;

    } catch (err) {
        console.error("Server Error:", err);
        return "⚠️ Server Error";
    }
}


/* ---------------------------
   UTILS
----------------------------*/
function debounce(fn, delay) {
    let timeout;
    function wrapper(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    }
    wrapper.cancel = () => clearTimeout(timeout);
    return wrapper;
}

function getStrength(text) {
    if (text.length < 5) return "Weak";
    if (text.length < 10) return "Medium";
    return "Strong";
}


/* ---------------------------
   AUTO UPDATE
----------------------------*/
// When typing, only update counters and strength; do NOT auto-call backend.
const debouncedUpdate = debounce(() => {
    const inputText = inputEl.value;

    if (!inputText) {
        outputEl.textContent = "";
        outputEl.classList.remove("active");
        charCountEl.textContent = "0";
        strengthEl.textContent = "N/A";
        return;
    }

    // update UI hints only; user must press Encode/Decode to produce output
    outputEl.textContent = "";
    outputEl.classList.remove("active");
    charCountEl.textContent = inputText.length;
    strengthEl.textContent = getStrength(inputText);
}, 50);


/* ---------------------------
   HISTORY SYSTEM
----------------------------*/
function addHistory(input, output, cipher, shift, caseMode, mode) {
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
        <div><strong>${mode === "encode" ? "🔐 Encoded" : "🔓 Decoded"}</strong></div>
        <div><strong>Input:</strong> ${input}</div>
        <div><strong>Output:</strong> ${output}</div>
        <div><strong>Cipher:</strong> ${cipher}</div>
        <div><strong>Shift:</strong> ${shift}</div>
        <div><strong>Case:</strong> ${caseMode}</div>
        <hr>
    `;

    historyEl.prepend(div);
}


/* ---------------------------
   BUTTONS: ENCODE / DECODE
----------------------------*/
document.getElementById("encode").addEventListener("click", async () => {
    if (debouncedUpdate.cancel) debouncedUpdate.cancel();

    const inputText = inputEl.value;

    const val = await transformBackend(
        inputText,
        cipherEl.value,
        shiftEl.value,
        "encode",
        caseSwitchEl.value
    );

    outputEl.textContent = val;
    outputEl.classList.add("active");
    charCountEl.textContent = inputText.length;
    strengthEl.textContent = getStrength(inputText);

    if (inputText) {
        addHistory(inputText, val, cipherEl.value, shiftEl.value, caseSwitchEl.value, "encode");
    }
});

document.getElementById("decode").addEventListener("click", async () => {
    if (debouncedUpdate.cancel) debouncedUpdate.cancel();

    const inputText = inputEl.value;

    const val = await transformBackend(
        inputText,
        cipherEl.value,
        shiftEl.value,
        "decode",
        caseSwitchEl.value
    );

    outputEl.textContent = val;
    // ensure the output area is visible
    outputEl.classList.add("active");
    charCountEl.textContent = inputText.length;
    strengthEl.textContent = getStrength(inputText);

    if (inputText) {
        addHistory(inputText, val, cipherEl.value, shiftEl.value, caseSwitchEl.value, "decode");
    }
});


/* ---------------------------
   COPY BUTTON
----------------------------*/
copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(outputEl.textContent);
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => (copyBtn.textContent = "📋 Copy"), 1500);
});


/* ---------------------------
   CLEAR BUTTON
----------------------------*/
document.getElementById("clear").addEventListener("click", () => {
    inputEl.value = "";
    outputEl.textContent = "";
    outputEl.classList.remove("active");
    charCountEl.textContent = "0";
    strengthEl.textContent = "N/A";
});


/* ---------------------------
   HISTORY CLEAR
----------------------------*/
clearHistoryBtn.addEventListener("click", () => {
    historyEl.innerHTML = "";
});


/* ---------------------------
   INPUT AUTO UPDATE
----------------------------*/
inputEl.addEventListener("input", debouncedUpdate);
cipherEl.addEventListener("change", debouncedUpdate);
shiftEl.addEventListener("input", debouncedUpdate);
caseSwitchEl.addEventListener("change", debouncedUpdate);


/* ---------------------------
   VIRTUAL KEYBOARD
----------------------------*/
// keyboard layout split into rows so CSS .keyboard-row can arrange keys correctly
const keyRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
    ["SPACE", "BACKSPACE"]
];

function renderKeyboard(container, targetInput) {
    if (!container || !targetInput) {
        console.warn("Keyboard container or target input not found");
        return;
    }

    container.innerHTML = "";

    // For each row, create a wrapper so CSS .keyboard-row styles apply
    keyRows.forEach((row, rowIndex) => {
        const rowEl = document.createElement("div");
        // add row-specific class to allow staggered offsets
        rowEl.className = "keyboard-row row-" + (rowIndex + 1) + (rowIndex === keyRows.length - 1 ? " bottom-row" : "");

        row.forEach(key => {
            const btn = document.createElement("button");
            btn.className = "key";

            if (key === "SPACE") {
                btn.textContent = "⎵ Space";
                btn.classList.add('space-key');
            } else if (key === "BACKSPACE") {
                btn.textContent = "⌫ Backspace";
            } else {
                btn.textContent = key;
            }

            btn.addEventListener("click", () => {
                if (key === "SPACE") {
                    targetInput.value += " ";
                } else if (key === "BACKSPACE") {
                    targetInput.value = targetInput.value.slice(0, -1);
                } else {
                    targetInput.value += key;
                }
                // Only focus the real input element (not the modal input) to avoid opening the native mobile keyboard
                if (targetInput === inputEl) targetInput.focus();
                debouncedUpdate();
            });

            rowEl.appendChild(btn);
        });

        container.appendChild(rowEl);
    });
}

if (keyboardModalInner && modalInput) {
    renderKeyboard(keyboardModalInner, modalInput);
}
if (keyboard && inputEl) {
    renderKeyboard(keyboard, inputEl);
}


/* ---------------------------
   KEYBOARD MODAL
----------------------------*/
if (keyboardToggle && keyboardModal) {
    keyboardToggle.addEventListener("click", () => {
        // blur active element to hide native mobile keyboard if open
        try { if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur(); } catch (e) { }
        keyboardModal.style.display = "flex";
        document.body.classList.add('keyboard-open');
    });
}

if (closeBtn && keyboardModal) {
    closeBtn.addEventListener("click", () => {
        keyboardModal.style.display = "none";
        document.body.classList.remove('keyboard-open');
    });
}

if (submitBtn && keyboardModal && modalInput && inputEl) {
    submitBtn.addEventListener("click", () => {
        inputEl.value += modalInput.value;
        modalInput.value = "";
        keyboardModal.style.display = "none";
        document.body.classList.remove('keyboard-open');
        debouncedUpdate();
    });
}

inputEl.addEventListener("focus", (e) => {
    if (keyboardModal.style.display === "flex") {
        e.preventDefault();
        inputEl.blur(); // blur to prevent native keyboard
    }
});

btn.addEventListener("click", () => {
    if (key === "SPACE") modalInput.value += " ";
    else if (key === "BACKSPACE") modalInput.value = modalInput.value.slice(0, -1);
    else modalInput.value += key;

    debouncedUpdate(); // update counters
});

keyboardToggle.addEventListener("click", () => {
    keyboardModal.style.display = "flex";
    document.body.classList.add('keyboard-open');

    // optional: scroll modal into view
    keyboardModal.scrollIntoView({ behavior: "smooth" });
});
