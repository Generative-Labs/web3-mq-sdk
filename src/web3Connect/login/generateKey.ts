import sha3 from 'js-sha3';
import { randomPrivateKey, getPublicKey } from '../core/noble';
import { byteArrayToHexString } from '../core/utils';
import { LOCALSTORAGE_KEY_MAP } from '../core/constants';

export function getRSAPEMData(buffer: ArrayBuffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  var base64 = window.btoa(binary);
  var text = base64.replace(/[^\x00-\xff]/g, '$&\x01').replace(/.{64}\x01?/g, '$&\n');

  return text;
}

const generateEd25519 = async () => {
  let privateKey = randomPrivateKey();

  let publicKey = await getPublicKey(privateKey);
  console.log('privateKey', privateKey);
  console.log('publicKey', publicKey);
  return {
    privateKey: byteArrayToHexString(privateKey),
    publicKey: byteArrayToHexString(publicKey),
  };
};

// Generate RSA key pair use broswer api
const generateRsa = async () => {
  let algorithmOps = {
    name: 'RSA-OAEP',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-512',
  };

  //@ts-ignore
  const key = await window.crypto.subtle.generateKey(
    algorithmOps,
    true, //whether the key is extractable (i.e. can be used in exportKey)
    ['encrypt', 'decrypt'],
  );

  //@ts-ignore
  const prvKeyData = await window.crypto.subtle.exportKey('pkcs8', key.privateKey);
  const privateKey = getRSAPEMData(prvKeyData);

  //@ts-ignore
  const pubKeyData = await window.crypto.subtle.exportKey('spki', key.publicKey);
  var publicKey = getRSAPEMData(pubKeyData);

  return { privateKey, publicKey };
};

//Generate ed25519 key pair
export const generateEd25519KeyPair = async () => {
  const { publicKey, privateKey } = await generateEd25519();
  let userId = sha3.sha3_224(publicKey);

  localStorage.setItem(LOCALSTORAGE_KEY_MAP.PUBLICKEY, publicKey);
  localStorage.setItem(LOCALSTORAGE_KEY_MAP.PRIVATEKEY, privateKey);
  localStorage.setItem(LOCALSTORAGE_KEY_MAP.USERID, userId);

  return publicKey;
};

export const generateRsaKeyPair = async () => {
  const { publicKey } = await generateRsa();

  return publicKey;
};
