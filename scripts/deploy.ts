import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    console.log("Deploying HabitRegistry...");


    const habitRegistry = await ethers.deployContract("HabitRegistry");
    await habitRegistry.waitForDeployment();


    console.log("HabitRegistry deployed to:", await habitRegistry.getAddress());

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});