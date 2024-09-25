import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
import { Buffer } from "buffer";

// Set global Buffer
global.Buffer = Buffer;

// Define Crypto class with getRandomValues method
class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}

// Check if crypto is already defined in the global scope
const hasInbuiltWebCrypto = typeof window.crypto !== "undefined";

// Use existing crypto if available, otherwise create a new Crypto instance
const webCrypto = hasInbuiltWebCrypto ? window.crypto : new Crypto();

// Polyfill crypto object if it's not already defined
if (!hasInbuiltWebCrypto) {
  Object.defineProperty(window, "crypto", {
    configurable: true,
    enumerable: true,
    get: () => webCrypto,
  });
}