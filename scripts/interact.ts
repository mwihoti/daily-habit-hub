import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    console.log("Deploying fresh HabitRegistry contract with Hybrid approaches...");
    const habitRegistry = await ethers.deployContract("HabitRegistry");
    await habitRegistry.waitForDeployment();
    
    // The first account provided by Hardhat local node is the deployer/owner
    const [admin, user1] = await ethers.getSigners();
    
    console.log(`\n🔗 Contract deployed to: ${await habitRegistry.getAddress()}`);
    console.log(`👨‍💻 Server Admin Address: ${admin.address}`);
    console.log(`👤 App User Wallet:      ${user1.address}`);

    console.log(`\n--- Approach 1: User Self-Mint (Frontend) ---`);
    // Connect user1 to the contract and call recordHabit (They pay their own gas)
    const habitRegistryAsUser = habitRegistry.connect(user1);
    // TypeScript needs to be cast to 'any' nicely because the ABI was just updated in the background
    const tx1 = await (habitRegistryAsUser as any).recordHabit("Pushups", "ipfs://pushups");
    await tx1.wait();
    console.log(`✅ User verified their own 'Pushups' habit (via React/Wagmi).`);

    console.log(`\n--- Approach 2: Server Auto-Mint (Backend) ---`);
    // Admin calls adminRecordHabitForUser ON BEHALF of user1 (Admin pays gas for user)
    // By default, habitRegistry is still connected to the 'admin' Deployer who has onlyOwner permissions.
    const tx2 = await (habitRegistry as any).adminRecordHabitForUser(user1.address, "Running", "ipfs://running");
    await tx2.wait();
    console.log(`✅ Server automatically verified a 'Running' habit FOR the User (via Edge Function).`);

    // --- Final Verification ---
    const count = await habitRegistry.getUserRecordCount(user1.address);
    console.log(`\n--- 🎉 Final Results ---`);
    console.log(`The App User now has ${count} habit records perfectly attributed to their wallet!`);

    const records = await habitRegistry.getUserRecords(user1.address);
    for (let i = 0; i < records.length; i++) {
        const id = records[i];
        const recordData = await (habitRegistry as any).getRecord(id);
        const date = new Date(Number(recordData.timestamp) * 1000).toLocaleString();
        console.log(`   - Record ID #${id}: ${recordData.habitType} (Timestamp: ${date})`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
