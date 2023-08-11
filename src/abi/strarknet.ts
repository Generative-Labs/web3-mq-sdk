export const BraavosAbi = [
  {
    members: [
      {
        name: 'expire_at',
        offset: 0,
        type: 'felt',
      },
      {
        name: 'signer_id',
        offset: 1,
        type: 'felt',
      },
    ],
    name: 'DeferredRemoveSignerRequest',
    size: 2,
    type: 'struct',
  },
  {
    members: [
      {
        name: 'signer_0',
        offset: 0,
        type: 'felt',
      },
      {
        name: 'signer_1',
        offset: 1,
        type: 'felt',
      },
      {
        name: 'signer_2',
        offset: 2,
        type: 'felt',
      },
      {
        name: 'signer_3',
        offset: 3,
        type: 'felt',
      },
      {
        name: 'type',
        offset: 4,
        type: 'felt',
      },
      {
        name: 'reserved_0',
        offset: 5,
        type: 'felt',
      },
      {
        name: 'reserved_1',
        offset: 6,
        type: 'felt',
      },
    ],
    name: 'SignerModel',
    size: 7,
    type: 'struct',
  },
  {
    members: [
      {
        name: 'expire_at',
        offset: 0,
        type: 'felt',
      },
    ],
    name: 'DeferredMultisigDisableRequest',
    size: 1,
    type: 'struct',
  },
  {
    members: [
      {
        name: 'index',
        offset: 0,
        type: 'felt',
      },
      {
        name: 'signer',
        offset: 1,
        type: 'SignerModel',
      },
    ],
    name: 'IndexedSignerModel',
    size: 8,
    type: 'struct',
  },
  {
    members: [
      {
        name: 'transaction_hash',
        offset: 0,
        type: 'felt',
      },
      {
        name: 'expire_at_sec',
        offset: 1,
        type: 'felt',
      },
      {
        name: 'expire_at_block_num',
        offset: 2,
        type: 'felt',
      },
      {
        name: 'signer_1_id',
        offset: 3,
        type: 'felt',
      },
      {
        name: 'is_disable_multisig_transaction',
        offset: 4,
        type: 'felt',
      },
    ],
    name: 'PendingMultisigTransaction',
    size: 5,
    type: 'struct',
  },
  {
    members: [
      {
        name: 'to',
        offset: 0,
        type: 'felt',
      },
      {
        name: 'selector',
        offset: 1,
        type: 'felt',
      },
      {
        name: 'data_offset',
        offset: 2,
        type: 'felt',
      },
      {
        name: 'data_len',
        offset: 3,
        type: 'felt',
      },
    ],
    name: 'AccountCallArray',
    size: 4,
    type: 'struct',
  },
  {
    data: [
      {
        name: 'implementation',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'Upgraded',
    type: 'event',
  },
  {
    data: [
      {
        name: 'request',
        type: 'DeferredRemoveSignerRequest',
      },
    ],
    keys: [],
    name: 'SignerRemoveRequest',
    type: 'event',
  },
  {
    data: [
      {
        name: 'signer_id',
        type: 'felt',
      },
      {
        name: 'signer',
        type: 'SignerModel',
      },
    ],
    keys: [],
    name: 'SignerAdded',
    type: 'event',
  },
  {
    data: [
      {
        name: 'signer_id',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'SignerRemoved',
    type: 'event',
  },
  {
    data: [
      {
        name: 'request',
        type: 'DeferredRemoveSignerRequest',
      },
    ],
    keys: [],
    name: 'SignerRemoveRequestCancelled',
    type: 'event',
  },
  {
    data: [
      {
        name: 'public_key',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'AccountInitialized',
    type: 'event',
  },
  {
    data: [
      {
        name: 'request',
        type: 'DeferredMultisigDisableRequest',
      },
    ],
    keys: [],
    name: 'MultisigDisableRequest',
    type: 'event',
  },
  {
    data: [
      {
        name: 'request',
        type: 'DeferredMultisigDisableRequest',
      },
    ],
    keys: [],
    name: 'MultisigDisableRequestCancelled',
    type: 'event',
  },
  {
    data: [
      {
        name: 'num_signers',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'MultisigSet',
    type: 'event',
  },
  {
    data: [],
    keys: [],
    name: 'MultisigDisabled',
    type: 'event',
  },
  {
    inputs: [
      {
        name: 'interfaceId',
        type: 'felt',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        name: 'success',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'get_impl_version',
    outputs: [
      {
        name: 'res',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'public_key',
        type: 'felt',
      },
    ],
    name: 'initializer',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'new_implementation',
        type: 'felt',
      },
    ],
    name: 'upgrade',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'from_version',
        type: 'felt',
      },
    ],
    name: 'migrate_storage',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'signer',
        type: 'SignerModel',
      },
    ],
    name: 'add_signer',
    outputs: [
      {
        name: 'signer_id',
        type: 'felt',
      },
    ],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'remove_index',
        type: 'felt',
      },
      {
        name: 'added_signer',
        type: 'SignerModel',
      },
    ],
    name: 'swap_signers',
    outputs: [
      {
        name: 'signer_id',
        type: 'felt',
      },
    ],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'newPublicKey',
        type: 'felt',
      },
    ],
    name: 'setPublicKey',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'index',
        type: 'felt',
      },
    ],
    name: 'remove_signer',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'index',
        type: 'felt',
      },
    ],
    name: 'remove_signer_with_etd',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'removed_signer_id',
        type: 'felt',
      },
    ],
    name: 'cancel_deferred_remove_signer_req',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPublicKey',
    outputs: [
      {
        name: 'publicKey',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'get_public_key',
    outputs: [
      {
        name: 'res',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'get_signers',
    outputs: [
      {
        name: 'signers_len',
        type: 'felt',
      },
      {
        name: 'signers',
        type: 'IndexedSignerModel*',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'index',
        type: 'felt',
      },
    ],
    name: 'get_signer',
    outputs: [
      {
        name: 'signer',
        type: 'SignerModel',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'get_deferred_remove_signer_req',
    outputs: [
      {
        name: 'deferred_request',
        type: 'DeferredRemoveSignerRequest',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'get_execution_time_delay',
    outputs: [
      {
        name: 'etd_sec',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'hash',
        type: 'felt',
      },
      {
        name: 'signature_len',
        type: 'felt',
      },
      {
        name: 'signature',
        type: 'felt*',
      },
    ],
    name: 'is_valid_signature',
    outputs: [
      {
        name: 'is_valid',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'hash',
        type: 'felt',
      },
      {
        name: 'signature_len',
        type: 'felt',
      },
      {
        name: 'signature',
        type: 'felt*',
      },
    ],
    name: 'isValidSignature',
    outputs: [
      {
        name: 'isValid',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'get_multisig',
    outputs: [
      {
        name: 'multisig_num_signers',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'num_signers',
        type: 'felt',
      },
    ],
    name: 'set_multisig',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [],
    name: 'get_pending_multisig_transaction',
    outputs: [
      {
        name: 'pending_multisig_transaction',
        type: 'PendingMultisigTransaction',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'pending_calldata_len',
        type: 'felt',
      },
      {
        name: 'pending_calldata',
        type: 'felt*',
      },
      {
        name: 'pending_nonce',
        type: 'felt',
      },
      {
        name: 'pending_max_fee',
        type: 'felt',
      },
      {
        name: 'pending_transaction_version',
        type: 'felt',
      },
    ],
    name: 'sign_pending_multisig_transaction',
    outputs: [
      {
        name: 'response_len',
        type: 'felt',
      },
      {
        name: 'response',
        type: 'felt*',
      },
    ],
    type: 'function',
  },
  {
    inputs: [],
    name: 'disable_multisig',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [],
    name: 'disable_multisig_with_etd',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [],
    name: 'get_deferred_disable_multisig_req',
    outputs: [
      {
        name: 'deferred_request',
        type: 'DeferredMultisigDisableRequest',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cancel_deferred_disable_multisig_req',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'call_array_len',
        type: 'felt',
      },
      {
        name: 'call_array',
        type: 'AccountCallArray*',
      },
      {
        name: 'calldata_len',
        type: 'felt',
      },
      {
        name: 'calldata',
        type: 'felt*',
      },
    ],
    name: '__validate__',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'class_hash',
        type: 'felt',
      },
      {
        name: 'contract_address_salt',
        type: 'felt',
      },
      {
        name: 'implementation_address',
        type: 'felt',
      },
      {
        name: 'initializer_selector',
        type: 'felt',
      },
      {
        name: 'calldata_len',
        type: 'felt',
      },
      {
        name: 'calldata',
        type: 'felt*',
      },
    ],
    name: '__validate_deploy__',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'class_hash',
        type: 'felt',
      },
    ],
    name: '__validate_declare__',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'call_array_len',
        type: 'felt',
      },
      {
        name: 'call_array',
        type: 'AccountCallArray*',
      },
      {
        name: 'calldata_len',
        type: 'felt',
      },
      {
        name: 'calldata',
        type: 'felt*',
      },
    ],
    name: '__execute__',
    outputs: [
      {
        name: 'response_len',
        type: 'felt',
      },
      {
        name: 'response',
        type: 'felt*',
      },
    ],
    type: 'function',
  },
];

export const ArgentAbi = [
  {
    members: [
      {
        name: 'to',
        offset: 0,
        type: 'felt',
      },
      {
        name: 'selector',
        offset: 1,
        type: 'felt',
      },
      {
        name: 'data_offset',
        offset: 2,
        type: 'felt',
      },
      {
        name: 'data_len',
        offset: 3,
        type: 'felt',
      },
    ],
    name: 'CallArray',
    size: 4,
    type: 'struct',
  },
  {
    data: [
      {
        name: 'new_signer',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'signer_changed',
    type: 'event',
  },
  {
    data: [
      {
        name: 'new_guardian',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'guardian_changed',
    type: 'event',
  },
  {
    data: [
      {
        name: 'new_guardian',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'guardian_backup_changed',
    type: 'event',
  },
  {
    data: [
      {
        name: 'active_at',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'escape_guardian_triggered',
    type: 'event',
  },
  {
    data: [
      {
        name: 'active_at',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'escape_signer_triggered',
    type: 'event',
  },
  {
    data: [],
    keys: [],
    name: 'escape_canceled',
    type: 'event',
  },
  {
    data: [
      {
        name: 'new_guardian',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'guardian_escaped',
    type: 'event',
  },
  {
    data: [
      {
        name: 'new_signer',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'signer_escaped',
    type: 'event',
  },
  {
    data: [
      {
        name: 'new_implementation',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'account_upgraded',
    type: 'event',
  },
  {
    data: [
      {
        name: 'account',
        type: 'felt',
      },
      {
        name: 'key',
        type: 'felt',
      },
      {
        name: 'guardian',
        type: 'felt',
      },
    ],
    keys: [],
    name: 'account_created',
    type: 'event',
  },
  {
    data: [
      {
        name: 'hash',
        type: 'felt',
      },
      {
        name: 'response_len',
        type: 'felt',
      },
      {
        name: 'response',
        type: 'felt*',
      },
    ],
    keys: [],
    name: 'transaction_executed',
    type: 'event',
  },
  {
    inputs: [
      {
        name: 'call_array_len',
        type: 'felt',
      },
      {
        name: 'call_array',
        type: 'CallArray*',
      },
      {
        name: 'calldata_len',
        type: 'felt',
      },
      {
        name: 'calldata',
        type: 'felt*',
      },
    ],
    name: '__validate__',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'call_array_len',
        type: 'felt',
      },
      {
        name: 'call_array',
        type: 'CallArray*',
      },
      {
        name: 'calldata_len',
        type: 'felt',
      },
      {
        name: 'calldata',
        type: 'felt*',
      },
    ],
    name: '__execute__',
    outputs: [
      {
        name: 'retdata_size',
        type: 'felt',
      },
      {
        name: 'retdata',
        type: 'felt*',
      },
    ],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'class_hash',
        type: 'felt',
      },
    ],
    name: '__validate_declare__',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'selector',
        type: 'felt',
      },
      {
        name: 'calldata_size',
        type: 'felt',
      },
      {
        name: 'calldata',
        type: 'felt*',
      },
    ],
    name: '__validate_deploy__',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'hash',
        type: 'felt',
      },
      {
        name: 'sig_len',
        type: 'felt',
      },
      {
        name: 'sig',
        type: 'felt*',
      },
    ],
    name: 'isValidSignature',
    outputs: [
      {
        name: 'isValid',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'interfaceId',
        type: 'felt',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        name: 'success',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'signer',
        type: 'felt',
      },
      {
        name: 'guardian',
        type: 'felt',
      },
    ],
    name: 'initialize',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'implementation',
        type: 'felt',
      },
      {
        name: 'calldata_len',
        type: 'felt',
      },
      {
        name: 'calldata',
        type: 'felt*',
      },
    ],
    name: 'upgrade',
    outputs: [
      {
        name: 'retdata_len',
        type: 'felt',
      },
      {
        name: 'retdata',
        type: 'felt*',
      },
    ],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'call_array_len',
        type: 'felt',
      },
      {
        name: 'call_array',
        type: 'CallArray*',
      },
      {
        name: 'calldata_len',
        type: 'felt',
      },
      {
        name: 'calldata',
        type: 'felt*',
      },
    ],
    name: 'execute_after_upgrade',
    outputs: [
      {
        name: 'retdata_len',
        type: 'felt',
      },
      {
        name: 'retdata',
        type: 'felt*',
      },
    ],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'newSigner',
        type: 'felt',
      },
    ],
    name: 'changeSigner',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'newGuardian',
        type: 'felt',
      },
    ],
    name: 'changeGuardian',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'newGuardian',
        type: 'felt',
      },
    ],
    name: 'changeGuardianBackup',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [],
    name: 'triggerEscapeGuardian',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [],
    name: 'triggerEscapeSigner',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [],
    name: 'cancelEscape',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'newGuardian',
        type: 'felt',
      },
    ],
    name: 'escapeGuardian',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'newSigner',
        type: 'felt',
      },
    ],
    name: 'escapeSigner',
    outputs: [],
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSigner',
    outputs: [
      {
        name: 'signer',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getGuardian',
    outputs: [
      {
        name: 'guardian',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getGuardianBackup',
    outputs: [
      {
        name: 'guardianBackup',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getEscape',
    outputs: [
      {
        name: 'activeAt',
        type: 'felt',
      },
      {
        name: 'type',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVersion',
    outputs: [
      {
        name: 'version',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getName',
    outputs: [
      {
        name: 'name',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'hash',
        type: 'felt',
      },
      {
        name: 'sig_len',
        type: 'felt',
      },
      {
        name: 'sig',
        type: 'felt*',
      },
    ],
    name: 'is_valid_signature',
    outputs: [
      {
        name: 'is_valid',
        type: 'felt',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
