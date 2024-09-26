import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
import { Buffer } from "buffer";
import * as encoding from 'text-encoding';

global.Buffer = Buffer;

// getRandomValues polyfill
class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}

const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();

(() => {
  if (typeof crypto === "undefined") {
    Object.defineProperty(window, "crypto", {
      configurable: true,
      enumerable: true,
      get: () => webCrypto,
    });
  }
})();

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = encoding.TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = encoding.TextDecoder;
}