export interface SavePublicKeyParams {
  userid: string;
  pubkey: string;
  rsa_pubkey: string;
  signature: string;
  sign_content: string;
  timestamp: bigint;
  wallet_address: string;
  wallet_type: string;
}
