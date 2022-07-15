export interface SavePublicKeyParams {
  userid: string;
  pubkey: string;
  rsa_pubkey: string;
  signature: string;
  sign_content: string;
  timestamp: number;
  wallet_address: string;
  wallet_type: string;
}
