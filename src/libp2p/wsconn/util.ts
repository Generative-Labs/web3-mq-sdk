// import * as ed from '@noble/ed25519';
import sha3 from 'js-sha3';
import { byteArrayToHexString } from '../core/util';
import { sign } from '../noble';

export function GetContactBytes(command: any, bytes: Uint8Array) {
  const concatArray = new Uint8Array(bytes.length + 1);
  concatArray[0] = command;
  for (var i = 0; i < bytes.length; i++) {
    concatArray[i + 1] = bytes[i];
  }
  return concatArray;
}

export function GenerateMessageID(
  from: string,
  topic: string,
  timestamp: bigint,
  payload: Uint8Array,
) {
  return sha3.sha3_224
    .update(from)
    .update(topic)
    .update(timestamp.toString())
    .update(payload)
    .hex();
  return '';
}

export async function getDataSignature(msg: string) {
  const PrivateKey = localStorage.getItem('Ed25519PrivateKey');
  if (!PrivateKey) {
    console.log('Ed25519PrivateKey not found');
    return 'Ed25519PrivateKey not found';
  }
  //   let signature = await ed.sign(new TextEncoder().encode(msg), PrivateKey);
  let signature = await sign(new TextEncoder().encode(msg), PrivateKey);

  return byteArrayToHexString(signature);
}
