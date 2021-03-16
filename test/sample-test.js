const { expect } = require("chai");
const { utils } = require("ethers/lib");
const { parseEther } = require("ethers/lib/utils");
const { constants } = require("ethers");

FacetCutAction = {
  Add: 0,
  Replace: 1,
  Remove: 2,
};

function getSelectors(contract) {
  const signatures = [];
  for (const key of Object.keys(contract.functions)) {
    signatures.push(utils.keccak256(utils.toUtf8Bytes(key)).substr(0, 10));
  }
  return signatures;
}

describe("Greeter", function () {
  let solution;

  const token1Address = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const token2Address = "0x6b175474e89094c44da98b954eedeac495271d0f";

  before(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();

    // create diamond cut
    facets = [
      await ethers.getContractFactory("Pool"),
      await ethers.getContractFactory("PoolManager"),
    ];
    diamondCut = [];
    for (let i = 0; i < facets.length; i++) {
      const f = await facets[i].deploy();
      diamondCut.push({
        action: FacetCutAction.Add,
        facetAddress: f.address,
        functionSelectors: getSelectors(f),
      });
    }

    // create function mapping
    toMap = ["stake", "getStake"];
    extern = [];
    intern = [];

    const Pool = await ethers.getContractFactory("Pool");
    const IPool = await ethers.getContractAt("IPool", constants.AddressZero);
    for (let i = 0; i < toMap.length; i++) {
      extern.push(IPool.interface.getSighash(toMap[i]));
      intern.push(Pool.interface.getSighash(toMap[i]));
    }

    // deploy diamond
    Diamond = await ethers.getContractFactory("Diamond");
    const diamond = await Diamond.deploy(diamondCut, [
      await owner.getAddress(),
      extern,
      intern,
    ]);
    solution = await ethers.getContractAt("IPool", diamond.address);
  });
  it("Invalid token", async function () {
    await expect(
      solution.stake(parseEther("100"), token1Address)
    ).to.be.revertedWith("INVALID_TOKEN");
  });
  it("Add tokens", async function () {
    await solution.addToken(token1Address);
    await solution.addToken(token2Address);
  });
  it("Valid token 1", async function () {
    solution.stake(parseEther("100"), token1Address);
    expect(
      await solution.getStake(await owner.getAddress(), token1Address)
    ).to.eq(parseEther("100"));
  });
  it("Valid token 2", async function () {
    solution.stake(parseEther("500"), token2Address);
    expect(
      await solution.getStake(await owner.getAddress(), token2Address)
    ).to.eq(parseEther("500"));
  });
});
