// Character sets
const CHARACTER_SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  number: "0123456789",
  symbol: "!@#$%^&*(){}[]=<>/,.",
};

// Secure random integer generation
function getSecureRandomInt(max) {
  const maxUint32 = Math.pow(2, 32) - 1;
  const limit = maxUint32 - (maxUint32 % max);

  let values;
  do {
    values = new Uint32Array(1);
    crypto.getRandomValues(values);
  } while (values[0] > limit);

  return values[0] % max;
}

// Secure character selection from a string
function getSecureRandomChar(str) {
  return str[getSecureRandomInt(str.length)];
}

// Generate password with selected options
function generatePassword(lower, upper, number, symbol, length) {
  let charset = "";
  let requiredChars = [];

  // Build charset and collect required characters
  if (lower) {
    charset += CHARACTER_SETS.lower;
    requiredChars.push(getSecureRandomChar(CHARACTER_SETS.lower));
  }
  if (upper) {
    charset += CHARACTER_SETS.upper;
    requiredChars.push(getSecureRandomChar(CHARACTER_SETS.upper));
  }
  if (number) {
    charset += CHARACTER_SETS.number;
    requiredChars.push(getSecureRandomChar(CHARACTER_SETS.number));
  }
  if (symbol) {
    charset += CHARACTER_SETS.symbol;
    requiredChars.push(getSecureRandomChar(CHARACTER_SETS.symbol));
  }

  if (charset === "") return "";
  if (length < requiredChars.length) return "";

  // Generate remaining characters
  const remainingLength = length - requiredChars.length;
  const randomChars = Array.from({ length: remainingLength }, () =>
    getSecureRandomChar(charset)
  );

  //   combine and shuffle all characters
  const allChars = [...requiredChars, ...randomChars];

  //   fisher-yates shuffle technique using cryptographically secure random numbers
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  return allChars.join("");
}

// DOM Elements
const resultEl = document.getElementById("result");
const lengthEl = document.getElementById("length");
const lengthValueEl = document.getElementById("lengthValue");
const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const numbersEl = document.getElementById("numbers");
const symbolsEl = document.getElementById("symbols");
const generateEl = document.getElementById("generate");
const clipboardEl = document.getElementById("clipboard");

// Update length value display
lengthEl.addEventListener("input", (e) => {
  lengthValueEl.textContent = e.target.value;
});

// Generate password
generateEl.addEventListener("click", () => {
  const length = +lengthEl.value;
  const hasLower = lowercaseEl.checked;
  const hasUpper = uppercaseEl.checked;
  const hasNumber = numbersEl.checked;
  const hasSymbol = symbolsEl.checked;

  const password = generatePassword(
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol,
    length
  );
  resultEl.innerHTML = `<span class="text-gray-800">${
    password || "Please select at least one option"
  }</span>`;
});

// Copy to clipboard
clipboardEl.addEventListener("click", async () => {
  const password = resultEl.textContent;
  if (
    !password ||
    password === "Generated password will appear here" ||
    password === "Please select at least one option"
  )
    return;

  try {
    await navigator.clipboard.writeText(password);
    const originalText = clipboardEl.innerHTML;
    clipboardEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
                `;
    setTimeout(() => {
      clipboardEl.innerHTML = originalText;
    }, 1000);
  } catch (err) {
    alert("Failed to copy password!");
  }
});
