import sha3 from 'js-sha3';
import { randomPrivateKey, getPublicKey } from '../noble';
import { byteArrayToHexString } from '../core/util';
import { getRSAPEMData } from './util';

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
// import sha3 from 'js-sha3';
// import * as ed from '@noble/ed25519';
// // import { randomPrivateKey, getPublicKey } from '../noble';
// import { byteArrayToHexString } from '../core/util';
// import { getRSAPEMData } from './util';

// const generateEd25519 = async () => {
//   let PrivateKey = ed.utils.randomPrivateKey();

//   let PublicKey = await ed.getPublicKey(PrivateKey);

//   return {
//     privateKey: byteArrayToHexString(PrivateKey),
//     publicKey: byteArrayToHexString(PublicKey),
//   };
// };

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
  let publicKey = localStorage.getItem('Ed25519PublicKey');
  if (!publicKey) {
    const resp = await generateEd25519();
    publicKey = resp.publicKey;
    let privateKey = resp.privateKey;
    let userId = sha3.sha3_224(publicKey);

    console.log(privateKey);
    console.log(publicKey);

    localStorage.setItem('Ed25519PublicKey', publicKey);
    localStorage.setItem('Ed25519PrivateKey', privateKey);
    localStorage.setItem('UserId', userId);
  }
  return publicKey;
};

export const generateRsaKeyPair = async () => {
  let publicKey = localStorage.getItem('PrivateKey');
  if (!publicKey) {
    const resp = await generateRsa();
    publicKey = resp.publicKey;
    let privateKey = resp.privateKey;

    localStorage.setItem('PrivateKey', privateKey);
    localStorage.setItem('PublicKey', publicKey);
  }
  return publicKey;
};
