import { ethers, network } from 'hardhat';

// USDC contract addresses
const USDC_ADDRESSES: Record<string, string> = {
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // testnet USDC
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',           // mainnet USDC on Base
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = network.name;

  console.log(`Deploying on: ${networkName}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);

  const usdcAddress = USDC_ADDRESSES[networkName];
  if (!usdcAddress) throw new Error(`No USDC address configured for network: ${networkName}`);

  // Agent wallet = deployer wallet for now (set separately after deployment)
  const agentWallet = process.env.AGENT_WALLET_ADDRESS ?? deployer.address;

  const Factory = await ethers.getContractFactory('ProspectAgentSubscription');
  const contract = await Factory.deploy(usdcAddress, agentWallet);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`\nProspectAgentSubscription deployed to: ${address}`);
  console.log(`USDC: ${usdcAddress}`);
  console.log(`Agent wallet: ${agentWallet}`);
  console.log(`\nUpdate NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ADDRESS=${address} in apps/web/.env`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
