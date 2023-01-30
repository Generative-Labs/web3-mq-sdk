import ed from '@noble/ed25519';

const getEd25519SharedKey = async (myEd25519PrivateKey: string, targetUserPubkey: string) => {
  const sharedKey = await ed.getSharedSecret(myEd25519PrivateKey, targetUserPubkey);
  return sharedKey;
};

const stringToArrayBuffer = (str: string) => {
  let buf = new ArrayBuffer(str.length);
  let bufView = new Uint8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

const importSecretKey = async (rawKey: any, aesName: string) => {
  return await window.crypto.subtle.importKey('raw', rawKey, aesName, true, ['encrypt', 'decrypt']);
};

export const fromHexString = (hexString: any) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)));

const aesDecrypt = async (
  aesName: string,
  keyStr: string,
  keySize: number,
  iv: string,
  encoded: Uint8Array,
) => {
  const alg = {
    name: aesName,
    iv: stringToArrayBuffer(atob(iv)),
    length: keySize,
  };

  let key = await importSecretKey(stringToArrayBuffer(atob(keyStr)), aesName);

  let result = await window.crypto.subtle.decrypt(alg, key, encoded);

  return result;
};

const aesEncrypt = async (
  aesName: string,
  keyStr: string,
  keySize: number,
  iv: string,
  encoded: Uint8Array,
) => {
  const alg = {
    name: aesName,
    iv: stringToArrayBuffer(atob(iv)),
    length: keySize,
  };
  let key = await importSecretKey(stringToArrayBuffer(atob(keyStr)), aesName);
  let result = await window.crypto.subtle.encrypt(alg, key, encoded);
  return result;
};

const ByteArrayToHexString = (byteArray: Uint8Array) => {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
};

export const Uint8ToBase64String = (u8a: any) => {
  return window.btoa(String.fromCharCode.apply(String, u8a));
};

export const Base64StringToUint8 = (base64: string) => {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
};

export const GetAESBase64Key = async (hex_key: string) => {
  let master_key = await crypto.subtle.importKey('raw', fromHexString(hex_key), 'HKDF', false, [
    'deriveKey',
  ]);

  let aes_key_obj = await window.crypto.subtle.deriveKey(
    { name: 'HKDF', salt: new Uint8Array(), info: new Uint8Array(), hash: 'SHA-384' },
    master_key,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );

  let arrayBuffer = await crypto.subtle.exportKey('raw', aes_key_obj);
  const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  return base64String;
};

export const getMessageSharedSecret = async (
  myEd25519PrivateKey: string,
  targetUserPubkey: string,
) => {
  const sharedKey = await getEd25519SharedKey(myEd25519PrivateKey, targetUserPubkey);
  return ByteArrayToHexString(sharedKey);
};

export const aesGCMEncrypt = async (keyStr: string, iv: string, inputByteData: Uint8Array) => {
  const keySize = 256;
  return await aesEncrypt('AES-GCM', keyStr, keySize, iv, inputByteData);
};

export const aesGCMDecrypt = async (keyStr: string, iv: string, encoded: Uint8Array) => {
  const keySize = 256;
  return await aesDecrypt('AES-GCM', keyStr, keySize, iv, encoded);
};
