/**
 * scripts/setup-nft-metadata.ts
 *
 * Uploads achievement NFT metadata to Pinata IPFS, then calls
 * setAchievementURI on the deployed AchievementNFT contract for all 3 types.
 *
 * Usage:
 *   npx hardhat run scripts/setup-nft-metadata.ts --network fuji
 *
 * Required .env vars:
 *   PRIVATE_ADMIN_KEY                   — deployer/owner wallet
 *   NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS — deployed AchievementNFT address
 *   PINATA_API_KEY                      — (optional) Pinata v2 API key
 *   PINATA_SECRET_KEY                   — (optional) Pinata v2 secret
 *
 * If Pinata keys are absent, metadata is embedded as a base64 data URI
 * (self-contained, no external dependency).
 */

import pkg from 'hardhat';
const { ethers } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// ─── SVG artwork for each achievement ─────────────────────────────────────────

const WEEK_WARRIOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FF8C00"/>
      <stop offset="100%" stop-color="#1a0500"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" rx="32"/>
  <circle cx="200" cy="200" r="140" fill="none" stroke="#FF6B2B" stroke-width="3" opacity="0.5"/>
  <circle cx="200" cy="200" r="110" fill="none" stroke="#FFD700" stroke-width="1.5" opacity="0.3"/>
  <text x="200" y="175" text-anchor="middle" font-size="90" filter="url(#glow)">🔥</text>
  <text x="200" y="260" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="28" font-weight="900" fill="#FFD700" letter-spacing="2">WEEK WARRIOR</text>
  <text x="200" y="295" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#FF8C00" opacity="0.9">7 Check-Ins on Avalanche</text>
  <text x="200" y="348" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#FF6B2B" opacity="0.7">FitTribe • FITA</text>
</svg>`;

const IRON_CONSISTENT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#000814"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" rx="32"/>
  <circle cx="200" cy="200" r="140" fill="none" stroke="#60a5fa" stroke-width="3" opacity="0.5"/>
  <circle cx="200" cy="200" r="110" fill="none" stroke="#93c5fd" stroke-width="1.5" opacity="0.3"/>
  <text x="200" y="175" text-anchor="middle" font-size="90" filter="url(#glow)">💎</text>
  <text x="200" y="260" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="24" font-weight="900" fill="#93c5fd" letter-spacing="1">IRON CONSISTENT</text>
  <text x="200" y="295" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#60a5fa" opacity="0.9">30 Check-Ins on Avalanche</text>
  <text x="200" y="348" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#3b82f6" opacity="0.7">FitTribe • FITA</text>
</svg>`;

const CENTURY_CLUB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#0d0500"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" rx="32"/>
  <circle cx="200" cy="200" r="140" fill="none" stroke="#fbbf24" stroke-width="3" opacity="0.6"/>
  <circle cx="200" cy="200" r="110" fill="none" stroke="#fcd34d" stroke-width="1.5" opacity="0.3"/>
  <text x="200" y="175" text-anchor="middle" font-size="90" filter="url(#glow)">🏆</text>
  <text x="200" y="260" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="28" font-weight="900" fill="#fbbf24" letter-spacing="2">CENTURY CLUB</text>
  <text x="200" y="295" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#f59e0b" opacity="0.9">100 Check-Ins on Avalanche</text>
  <text x="200" y="348" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#d97706" opacity="0.7">FitTribe • FITA</text>
</svg>`;

// ─── Metadata definitions ──────────────────────────────────────────────────────

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const achievements = [
  {
    type: 0,
    name: 'Week Warrior',
    svg: WEEK_WARRIOR_SVG,
    metadata: {
      name: 'FitTribe: Week Warrior',
      description: 'Awarded to FitTribe athletes who recorded 7 on-chain check-ins. You showed up — 7 days, no excuses.',
      attributes: [
        { trait_type: 'Achievement',   value: 'Week Warrior'     },
        { trait_type: 'Requirement',   value: '7 check-ins'      },
        { trait_type: 'Platform',      value: 'FitTribe'         },
        { trait_type: 'Chain',         value: 'Avalanche'        },
        { trait_type: 'Soulbound',     value: 'Yes'              },
        { trait_type: 'Rarity',        value: 'Common'           },
      ],
    },
  },
  {
    type: 1,
    name: 'Iron Consistent',
    svg: IRON_CONSISTENT_SVG,
    metadata: {
      name: 'FitTribe: Iron Consistent',
      description: 'Awarded to FitTribe athletes who recorded 30 on-chain check-ins. Iron discipline. Pure consistency.',
      attributes: [
        { trait_type: 'Achievement',   value: 'Iron Consistent'  },
        { trait_type: 'Requirement',   value: '30 check-ins'     },
        { trait_type: 'Platform',      value: 'FitTribe'         },
        { trait_type: 'Chain',         value: 'Avalanche'        },
        { trait_type: 'Soulbound',     value: 'Yes'              },
        { trait_type: 'Rarity',        value: 'Rare'             },
      ],
    },
  },
  {
    type: 2,
    name: 'Century Club',
    svg: CENTURY_CLUB_SVG,
    metadata: {
      name: 'FitTribe: Century Club',
      description: 'Awarded to FitTribe athletes who recorded 100 on-chain check-ins. You are elite. 100 workouts on-chain — permanently.',
      attributes: [
        { trait_type: 'Achievement',   value: 'Century Club'     },
        { trait_type: 'Requirement',   value: '100 check-ins'    },
        { trait_type: 'Platform',      value: 'FitTribe'         },
        { trait_type: 'Chain',         value: 'Avalanche'        },
        { trait_type: 'Soulbound',     value: 'Yes'              },
        { trait_type: 'Rarity',        value: 'Legendary'        },
      ],
    },
  },
];

// ─── Pinata upload ─────────────────────────────────────────────────────────────

async function pinToIPFS(metadata: object, name: string): Promise<string | null> {
  const apiKey    = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;
  if (!apiKey || !secretKey) return null;

  const body = {
    pinataContent:  metadata,
    pinataMetadata: { name },
  };

  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method:  'POST',
    headers: {
      'Content-Type':          'application/json',
      'pinata_api_key':         apiKey,
      'pinata_secret_api_key':  secretKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(`  Pinata error for "${name}": ${text}`);
    return null;
  }

  const data = await res.json() as { IpfsHash: string };
  return `ipfs://${data.IpfsHash}`;
}

// ─── AchievementNFT minimal ABI ───────────────────────────────────────────────

const ACHIEVEMENT_NFT_ABI = [
  'function setAchievementURI(uint8 achievementType, string calldata uri) external',
  'function achievementURI(uint8) external view returns (string)',
  'function owner() external view returns (address)',
];

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const nftAddress = process.env.NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS;
  if (!nftAddress || nftAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS not set in .env');
  }

  const [deployer] = await ethers.getSigners();
  console.log(`\nUsing wallet: ${deployer.address}`);

  const nft = new ethers.Contract(nftAddress, ACHIEVEMENT_NFT_ABI, deployer);

  const hasPinata = !!(process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY);
  console.log(hasPinata
    ? '  Pinata keys found — uploading to IPFS'
    : '  No Pinata keys — using base64 data URIs (add PINATA_API_KEY to .env for real IPFS)');

  console.log('\n');

  for (const achievement of achievements) {
    console.log(`Processing type ${achievement.type}: ${achievement.name}`);

    const imageUri = svgToDataUri(achievement.svg);
    const fullMetadata = { ...achievement.metadata, image: imageUri };

    let uri: string;

    if (hasPinata) {
      const ipfsUri = await pinToIPFS(fullMetadata, `fittribe-${achievement.name.toLowerCase().replace(/\s+/g, '-')}`);
      if (ipfsUri) {
        uri = ipfsUri;
        console.log(`  Pinned to IPFS: ${uri}`);
      } else {
        // Fallback to data URI
        uri = `data:application/json;base64,${Buffer.from(JSON.stringify(fullMetadata)).toString('base64')}`;
        console.log(`  Pinata failed — using data URI`);
      }
    } else {
      uri = `data:application/json;base64,${Buffer.from(JSON.stringify(fullMetadata)).toString('base64')}`;
      console.log(`  Data URI (self-contained, no IPFS needed)`);
    }

    const tx = await nft.setAchievementURI(achievement.type, uri);
    console.log(`  tx: ${tx.hash}`);
    await tx.wait();
    console.log(`  ✅ setAchievementURI(${achievement.type}) done\n`);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('  ALL 3 ACHIEVEMENT URIs SET ON-CHAIN');
  console.log('═══════════════════════════════════════════════════\n');

  // Verify
  for (const a of achievements) {
    const uri = await nft.achievementURI(a.type);
    const preview = uri.startsWith('data:') ? uri.slice(0, 60) + '...' : uri;
    console.log(`  Type ${a.type} (${a.name}): ${preview}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
