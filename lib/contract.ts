import { ethers } from "ethers";
import contractInfo from "./abi/BettingForwards.json";

export const BETTING_FORWARDS_ADDRESS = process.env.NEXT_PUBLIC_BETTING_FORWARDS_CONTRACT_ADDRESS || "0x68C784E3654b9F021D301838aAF49a0E40C7EE8b";
export const BETTING_FORWARDS_ABI = contractInfo.abi;

export interface Forward {
  id: bigint;
  matchId: string;
  owner: string;
  odds: bigint;
  encryptedStakeRef: string;
  forSale: boolean;
  price: bigint;
  createdAt: bigint;
}

export interface ForwardData {
  forwardId: number;
  matchId: string;
  odds: number;
  owner: string;
  encryptedStakeRef: string;
  forSale: boolean;
  price: number;
  createdAt: number;
}

/**
 * Convert contract Forward struct to frontend ForwardData
 */
export function convertForwardData(forward: Forward, forwardId: number): ForwardData {
  return {
    forwardId,
    matchId: forward.matchId,
    odds: Number(forward.odds),
    owner: forward.owner,
    encryptedStakeRef: forward.encryptedStakeRef,
    forSale: forward.forSale,
    price: Number(ethers.formatEther(forward.price)),
    createdAt: Number(forward.createdAt) * 1000, // Convert to milliseconds
  };
}

/**
 * Get contract instance
 */
export function getContract(provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(BETTING_FORWARDS_ADDRESS, BETTING_FORWARDS_ABI, provider);
}

/**
 * Get all forwards for sale from contract
 */
export async function getForwardsForSale(provider: ethers.Provider): Promise<ForwardData[]> {
  const contract = getContract(provider);
  
  try {
    const forwardIds = await contract.getForwardsForSale();
    const forwards: ForwardData[] = [];
    
    for (const forwardId of forwardIds) {
      const forward = await contract.forwards(forwardId);
      forwards.push(convertForwardData(forward, Number(forwardId)));
    }
    
    return forwards;
  } catch (error) {
    console.error("Error fetching forwards for sale:", error);
    return [];
  }
}

/**
 * Get user's forwards from contract
 */
export async function getUserForwards(userAddress: string, provider: ethers.Provider): Promise<ForwardData[]> {
  const contract = getContract(provider);
  
  try {
    const forwardIds = await contract.getUserForwards(userAddress);
    const forwards: ForwardData[] = [];
    
    for (const forwardId of forwardIds) {
      const forward = await contract.forwards(forwardId);
      forwards.push(convertForwardData(forward, Number(forwardId)));
    }
    
    return forwards;
  } catch (error) {
    console.error("Error fetching user forwards:", error);
    return [];
  }
}

/**
 * Lock a forward on contract
 */
export async function lockForward(
  matchId: string,
  odds: number,
  encryptedStakeRef: string,
  signer: ethers.Signer
): Promise<bigint> {
  const contract = getContract(signer);
  
  const tx = await contract.lockForward(matchId, BigInt(Math.floor(odds * 100)), encryptedStakeRef);
  const receipt = await tx.wait();
  
  // Extract forward ID from event
  const event = receipt.logs.find((log: ethers.Log) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === "ForwardLocked";
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsed = contract.interface.parseLog(event);
    return parsed?.args.forwardId || BigInt(0);
  }
  
  throw new Error("Could not extract forward ID from transaction");
}

/**
 * List forward for sale on contract
 */
export async function listForwardForSale(
  forwardId: number,
  priceInEth: number,
  signer: ethers.Signer
): Promise<void> {
  const contract = getContract(signer);
  
  const priceInWei = ethers.parseEther(priceInEth.toString());
  const tx = await contract.listForSale(forwardId, priceInWei);
  await tx.wait();
}

/**
 * Buy forward from contract using wagmi
 */
export async function buyForwardWithWagmi(
  forwardId: number,
  priceInEth: number,
  writeContract: (args: unknown) => Promise<void>
): Promise<void> {
  const priceInWei = ethers.parseEther(priceInEth.toString());
  
  await writeContract({
    address: BETTING_FORWARDS_ADDRESS as `0x${string}`,
    abi: BETTING_FORWARDS_ABI,
    functionName: "buyForward",
    args: [forwardId],
    value: priceInWei,
  });
}
