// ─── Contract Addresses ───────────────────────────────────────────────────────
// Update these after running: npx hardhat run scripts/deploy.ts --network fuji

export const HABIT_REGISTRY_ADDRESS = (
  process.env.NEXT_PUBLIC_HABIT_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

export const HABIT_TOKEN_ADDRESS = (
  process.env.NEXT_PUBLIC_HABIT_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

export const ACHIEVEMENT_NFT_ADDRESS = (
  process.env.NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS || '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

// ─── HabitRegistry v2 ABI ────────────────────────────────────────────────────
export const HABIT_REGISTRY_ABI = [
  // Constructor
  { inputs: [{ internalType: 'address', name: '_habitToken', type: 'address' }, { internalType: 'address', name: '_achievementNFT', type: 'address' }], stateMutability: 'nonpayable', type: 'constructor' },
  // Events
  { anonymous: false, inputs: [{ indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' }, { indexed: true, internalType: 'address', name: 'user', type: 'address' }, { indexed: false, internalType: 'string', name: 'habitType', type: 'string' }], name: 'HabitRecorded', type: 'event' },
  // Ownable events
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' }, { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' }], name: 'OwnershipTransferred', type: 'event' },
  // Pausable events
  { anonymous: false, inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }], name: 'Paused', type: 'event' },
  { anonymous: false, inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }], name: 'Unpaused', type: 'event' },
  // Write functions
  { inputs: [{ internalType: 'string', name: 'habitType', type: 'string' }, { internalType: 'string', name: 'metadataUri', type: 'string' }], name: 'recordHabit', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'targetUser', type: 'address' }, { internalType: 'string', name: 'habitType', type: 'string' }, { internalType: 'string', name: 'metadataUri', type: 'string' }], name: 'adminRecordHabitForUser', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }], name: 'transferOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  // View functions
  { inputs: [{ internalType: 'address', name: 'user', type: 'address' }], name: 'getUserRecordCount', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'user', type: 'address' }], name: 'getUserRecords', outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'user', type: 'address' }, { internalType: 'uint256', name: 'offset', type: 'uint256' }, { internalType: 'uint256', name: 'limit', type: 'uint256' }], name: 'getUserRecordsPaginated', outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }], name: 'getRecord', outputs: [{ components: [{ internalType: 'address', name: 'user', type: 'address' }, { internalType: 'string', name: 'habitType', type: 'string' }, { internalType: 'uint256', name: 'timestamp', type: 'uint256' }, { internalType: 'string', name: 'metadataUri', type: 'string' }], internalType: 'struct HabitRegistry.HabitRecord', name: '', type: 'tuple' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'user', type: 'address' }], name: 'canRecordToday', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'lastRecordDay', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'DAILY_REWARD', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'owner', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'paused', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'habitToken', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'achievementNFT', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
] as const;

// ─── HabitToken ($HABIT) ABI ─────────────────────────────────────────────────
export const HABIT_TOKEN_ABI = [
  { inputs: [], name: 'name', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'symbol', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'decimals', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalSupply', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'cap', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'transfer', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'minter', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'from', type: 'address' }, { indexed: true, internalType: 'address', name: 'to', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'Transfer', type: 'event' },
] as const;

// ─── AchievementNFT (FITA) ABI ───────────────────────────────────────────────
export const ACHIEVEMENT_NFT_ABI = [
  { inputs: [], name: 'name', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'symbol', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalSupply', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'owner', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'tokenURI', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'WEEK_WARRIOR', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'IRON_CONSISTENT', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'CENTURY_CLUB', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: '', type: 'address' }, { internalType: 'uint8', name: '', type: 'uint8' }], name: 'hasAchievement', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'user', type: 'address' }, { indexed: true, internalType: 'uint8', name: 'achievementType', type: 'uint8' }, { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'AchievementMinted', type: 'event' },
] as const;

// ─── Achievement metadata (client-side display) ───────────────────────────────
export const ACHIEVEMENTS = [
  { type: 0, name: 'Week Warrior',    emoji: '🔥', description: '7 on-chain check-ins',   color: 'from-orange-500 to-amber-400' },
  { type: 1, name: 'Iron Consistent', emoji: '💎', description: '30 on-chain check-ins',  color: 'from-blue-500 to-cyan-400' },
  { type: 2, name: 'Century Club',    emoji: '🏆', description: '100 on-chain check-ins', color: 'from-yellow-500 to-orange-400' },
] as const;
