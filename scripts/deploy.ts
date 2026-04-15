import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX\n");

  // ── 1. Deploy HabitToken ──────────────────────────────────────────────────
  console.log("1/3  Deploying HabitToken ($HABIT)...");
  const HabitToken = await ethers.getContractFactory("HabitToken");
  const habitToken = await HabitToken.deploy();
  await habitToken.waitForDeployment();
  const tokenAddr = await habitToken.getAddress();
  console.log("     ✅ HabitToken:    ", tokenAddr);

  // ── 2. Deploy AchievementNFT ──────────────────────────────────────────────
  console.log("2/3  Deploying AchievementNFT (FITA)...");
  const AchievementNFT = await ethers.getContractFactory("AchievementNFT");
  const achievementNFT = await AchievementNFT.deploy();
  await achievementNFT.waitForDeployment();
  const nftAddr = await achievementNFT.getAddress();
  console.log("     ✅ AchievementNFT:", nftAddr);

  // ── 3. Deploy HabitRegistry v2 ────────────────────────────────────────────
  console.log("3/3  Deploying HabitRegistry v2...");
  const HabitRegistry = await ethers.getContractFactory("HabitRegistry");
  const habitRegistry = await HabitRegistry.deploy(tokenAddr, nftAddr);
  await habitRegistry.waitForDeployment();
  const registryAddr = await habitRegistry.getAddress();
  console.log("     ✅ HabitRegistry: ", registryAddr);

  // ── 4. Wire permissions ───────────────────────────────────────────────────
  console.log("\nWiring permissions...");

  const tx1 = await (habitToken as any).setMinter(registryAddr);
  await tx1.wait();
  console.log("     ✅ HabitToken minter  → HabitRegistry");

  const tx2 = await (achievementNFT as any).setMinter(registryAddr);
  await tx2.wait();
  console.log("     ✅ AchievementNFT minter → HabitRegistry");

  // ── 5. Summary ────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE — copy these to your .env");
  console.log("═══════════════════════════════════════════════════");
  console.log(`NEXT_PUBLIC_HABIT_REGISTRY_ADDRESS=${registryAddr}`);
  console.log(`NEXT_PUBLIC_HABIT_TOKEN_ADDRESS=${tokenAddr}`);
  console.log(`NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS=${nftAddr}`);
  console.log("═══════════════════════════════════════════════════\n");
  console.log("Next steps:");
  console.log("  npx hardhat verify --network avalanche", registryAddr, tokenAddr, nftAddr);
  console.log("  npx hardhat verify --network avalanche", tokenAddr);
  console.log("  npx hardhat verify --network avalanche", nftAddr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
