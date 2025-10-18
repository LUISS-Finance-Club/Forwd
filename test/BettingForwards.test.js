import { expect } from "chai";
import { ethers } from "hardhat";

describe("BettingForwards", function () {
  let bettingForwards;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
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
  });
});
