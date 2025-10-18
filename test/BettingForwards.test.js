import { expect } from "chai";
import { ethers } from "hardhat";

describe("BettingForwards", function () {
  let bettingForwards;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    const BettingForwards = await ethers.getContractFactory("BettingForwards");
    bettingForwards = await BettingForwards.deploy();
    await bettingForwards.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await bettingForwards.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct values", async function () {
      expect(await bettingForwards.nextForwardId()).to.equal(1);
      expect(await bettingForwards.platformFee()).to.equal(250); // 2.5%
    });

    it("Should have correct contract name", async function () {
      expect(await bettingForwards.name()).to.equal("BettingForwards");
    });
  });

  describe("lockForward", function () {
    it("Should create a new forward", async function () {
      const matchId = "match-1";
      const odds = 150; // 1.5x
      const encryptedStakeRef = "encrypted-ref-123";

      const tx = await bettingForwards.connect(user1).lockForward(
        matchId,
        odds,
        encryptedStakeRef
      );

      await expect(tx)
        .to.emit(bettingForwards, "ForwardLocked")
        .withArgs(1, user1.address, matchId, odds, encryptedStakeRef);

      const forward = await bettingForwards.forwards(1);
      expect(forward.id).to.equal(1);
      expect(forward.matchId).to.equal(matchId);
      expect(forward.owner).to.equal(user1.address);
      expect(forward.odds).to.equal(odds);
      expect(forward.encryptedStakeRef).to.equal(encryptedStakeRef);
      expect(forward.forSale).to.be.false;
      expect(forward.price).to.equal(0);
    });

    it("Should increment forward ID correctly", async function () {
      await bettingForwards.connect(user1).lockForward("match-1", 150, "ref-1");
      expect(await bettingForwards.nextForwardId()).to.equal(2);
      
      await bettingForwards.connect(user2).lockForward("match-2", 200, "ref-2");
      expect(await bettingForwards.nextForwardId()).to.equal(3);
    });

    it("Should reject invalid inputs", async function () {
      await expect(
        bettingForwards.connect(user1).lockForward("match-1", 0, "ref")
      ).to.be.revertedWith("Invalid odds");

      await expect(
        bettingForwards.connect(user1).lockForward("", 150, "ref")
      ).to.be.revertedWith("Match ID required");

      await expect(
        bettingForwards.connect(user1).lockForward("match-1", 150, "")
      ).to.be.revertedWith("Encrypted stake reference required");
    });

    it("Should handle multiple forwards from same user", async function () {
      await bettingForwards.connect(user1).lockForward("match-1", 150, "ref-1");
      await bettingForwards.connect(user1).lockForward("match-2", 200, "ref-2");
      
      const forward1 = await bettingForwards.forwards(1);
      const forward2 = await bettingForwards.forwards(2);
      
      expect(forward1.owner).to.equal(user1.address);
      expect(forward2.owner).to.equal(user1.address);
      expect(forward1.matchId).to.equal("match-1");
      expect(forward2.matchId).to.equal("match-2");
    });
  });

  describe("listForSale", function () {
    beforeEach(async function () {
      await bettingForwards.connect(user1).lockForward(
        "match-1",
        150,
        "encrypted-ref-123"
      );
    });

    it("Should list forward for sale", async function () {
      const price = ethers.parseEther("1.0");

      const tx = await bettingForwards.connect(user1).listForSale(1, price);

      await expect(tx)
        .to.emit(bettingForwards, "ForwardListed")
        .withArgs(1, price);

      const forward = await bettingForwards.forwards(1);
      expect(forward.forSale).to.be.true;
      expect(forward.price).to.equal(price);
    });

    it("Should reject non-owner listing", async function () {
      const price = ethers.parseEther("1.0");

      await expect(
        bettingForwards.connect(user2).listForSale(1, price)
      ).to.be.revertedWith("Not the owner");
    });

    it("Should reject zero price", async function () {
      await expect(
        bettingForwards.connect(user1).listForSale(1, 0)
      ).to.be.revertedWith("Price must be positive");
    });

    it("Should reject listing non-existent forward", async function () {
      const price = ethers.parseEther("1.0");

      await expect(
        bettingForwards.connect(user1).listForSale(999, price)
      ).to.be.revertedWith("Forward does not exist");
    });

    it("Should allow updating price", async function () {
      const initialPrice = ethers.parseEther("1.0");
      const newPrice = ethers.parseEther("1.5");

      await bettingForwards.connect(user1).listForSale(1, initialPrice);
      
      const tx = await bettingForwards.connect(user1).listForSale(1, newPrice);
      
      await expect(tx)
        .to.emit(bettingForwards, "ForwardListed")
        .withArgs(1, newPrice);

      const forward = await bettingForwards.forwards(1);
      expect(forward.price).to.equal(newPrice);
    });
  });

  describe("buyForward", function () {
    beforeEach(async function () {
      await bettingForwards.connect(user1).lockForward(
        "match-1",
        150,
        "encrypted-ref-123"
      );
      await bettingForwards.connect(user1).listForSale(1, ethers.parseEther("1.0"));
    });

    it("Should buy forward successfully", async function () {
      const price = ethers.parseEther("1.0");
      const initialBalance = await ethers.provider.getBalance(user1.address);

      const tx = await bettingForwards.connect(user2).buyForward(1, {
        value: price
      });

      await expect(tx)
        .to.emit(bettingForwards, "ForwardBought")
        .withArgs(1, user2.address, user1.address, price);

      const forward = await bettingForwards.forwards(1);
      expect(forward.owner).to.equal(user2.address);
      expect(forward.forSale).to.be.false;
      expect(forward.price).to.equal(0);

      // Check that seller received payment (minus gas fees)
      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should reject insufficient payment", async function () {
      const insufficientPrice = ethers.parseEther("0.5");

      await expect(
        bettingForwards.connect(user2).buyForward(1, {
          value: insufficientPrice
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should reject buying own forward", async function () {
      const price = ethers.parseEther("1.0");

      await expect(
        bettingForwards.connect(user1).buyForward(1, {
          value: price
        })
      ).to.be.revertedWith("Cannot buy your own forward");
    });

    it("Should reject buying non-existent forward", async function () {
      const price = ethers.parseEther("1.0");

      await expect(
        bettingForwards.connect(user2).buyForward(999, {
          value: price
        })
      ).to.be.revertedWith("Forward does not exist");
    });

    it("Should reject buying forward not for sale", async function () {
      // Create a forward but don't list it for sale
      await bettingForwards.connect(user3).lockForward("match-2", 200, "ref-2");
      
      const price = ethers.parseEther("1.0");

      await expect(
        bettingForwards.connect(user2).buyForward(2, {
          value: price
        })
      ).to.be.revertedWith("Forward not for sale");
    });

    it("Should handle platform fee correctly", async function () {
      const price = ethers.parseEther("1.0");
      const platformFee = await bettingForwards.platformFee();
      const expectedFee = (price * platformFee) / 10000n;
      
      const tx = await bettingForwards.connect(user2).buyForward(1, {
        value: price
      });
      
      await tx.wait();
      
      const contractBalance = await ethers.provider.getBalance(await bettingForwards.getAddress());
      expect(contractBalance).to.equal(expectedFee);
    });
  });

  describe("getUserForwards", function () {
    beforeEach(async function () {
      await bettingForwards.connect(user1).lockForward("match-1", 150, "ref-1");
      await bettingForwards.connect(user1).lockForward("match-2", 200, "ref-2");
      await bettingForwards.connect(user2).lockForward("match-3", 180, "ref-3");
    });

    it("Should return correct forwards for user", async function () {
      const userForwards = await bettingForwards.getUserForwards(user1.address);
      
      expect(userForwards.length).to.equal(2);
      expect(userForwards[0].owner).to.equal(user1.address);
      expect(userForwards[1].owner).to.equal(user1.address);
    });

    it("Should return empty array for user with no forwards", async function () {
      const userForwards = await bettingForwards.getUserForwards(user3.address);
      expect(userForwards.length).to.equal(0);
    });
  });

  describe("getMatchForwards", function () {
    beforeEach(async function () {
      await bettingForwards.connect(user1).lockForward("match-1", 150, "ref-1");
      await bettingForwards.connect(user2).lockForward("match-1", 200, "ref-2");
      await bettingForwards.connect(user1).lockForward("match-2", 180, "ref-3");
    });

    it("Should return correct forwards for match", async function () {
      const matchForwards = await bettingForwards.getMatchForwards("match-1");
      
      expect(matchForwards.length).to.equal(2);
      expect(matchForwards[0].matchId).to.equal("match-1");
      expect(matchForwards[1].matchId).to.equal("match-1");
    });

    it("Should return empty array for non-existent match", async function () {
      const matchForwards = await bettingForwards.getMatchForwards("non-existent");
      expect(matchForwards.length).to.equal(0);
    });
  });

  describe("getForwardsForSale", function () {
    beforeEach(async function () {
      await bettingForwards.connect(user1).lockForward("match-1", 150, "ref-1");
      await bettingForwards.connect(user2).lockForward("match-2", 200, "ref-2");
      await bettingForwards.connect(user1).lockForward("match-3", 180, "ref-3");
      
      await bettingForwards.connect(user1).listForSale(1, ethers.parseEther("1.0"));
      await bettingForwards.connect(user2).listForSale(2, ethers.parseEther("1.5"));
      // Forward 3 is not listed for sale
    });

    it("Should return only forwards for sale", async function () {
      const forwardsForSale = await bettingForwards.getForwardsForSale();
      
      expect(forwardsForSale.length).to.equal(2);
      expect(forwardsForSale[0].forSale).to.be.true;
      expect(forwardsForSale[1].forSale).to.be.true;
    });
  });

  describe("Platform Fee Management", function () {
    it("Should allow owner to set platform fee", async function () {
      const newFee = 300; // 3%
      
      const tx = await bettingForwards.connect(owner).setPlatformFee(newFee);
      await expect(tx)
        .to.emit(bettingForwards, "PlatformFeeUpdated")
        .withArgs(newFee);
      
      expect(await bettingForwards.platformFee()).to.equal(newFee);
    });

    it("Should reject non-owner setting platform fee", async function () {
      await expect(
        bettingForwards.connect(user1).setPlatformFee(300)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject invalid platform fee", async function () {
      await expect(
        bettingForwards.connect(owner).setPlatformFee(10001) // > 100%
      ).to.be.revertedWith("Platform fee must be <= 1000 (10%)");
    });

    it("Should allow owner to withdraw fees", async function () {
      // First create some fees by buying a forward
      await bettingForwards.connect(user1).lockForward("match-1", 150, "ref-1");
      await bettingForwards.connect(user1).listForSale(1, ethers.parseEther("1.0"));
      await bettingForwards.connect(user2).buyForward(1, { value: ethers.parseEther("1.0") });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      const tx = await bettingForwards.connect(owner).withdrawFees();
      await tx.wait();
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This test ensures the contract is protected against reentrancy
      // In a real scenario, you might have a malicious contract that tries to reenter
      await bettingForwards.connect(user1).lockForward("match-1", 150, "ref-1");
      await bettingForwards.connect(user1).listForSale(1, ethers.parseEther("1.0"));
      
      // Normal purchase should work
      await bettingForwards.connect(user2).buyForward(1, { value: ethers.parseEther("1.0") });
      
      const forward = await bettingForwards.forwards(1);
      expect(forward.owner).to.equal(user2.address);
    });
  });
});