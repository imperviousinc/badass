const ENS = artifacts.require("@ensdomains/ens/ENSRegistry");
const ETHRegistrar = artifacts.require('@ensdomains/ethregistrar/ETHRegistrarController');
const BaseRegistrar = artifacts.require('@ensdomains/ethregistrar/BaseRegistrarImplementation');
const PriceOracle = artifacts.require('@ensdomains/ethregistrar/StablePriceOracle');
const DummyOracle = artifacts.require('@ensdomains/ethregistrar/DummyOracle');
const PublicResolver = artifacts.require("@ensdomains/resolver/PublicResolver");

const web3 = new (require('web3'))();
const namehash = require('eth-ens-namehash');

/**
 * Calculate root node hashes given the top level domain(tld)
 *
 * @param {string} tld plain text tld, for example: 'eth'
 */
function getRootNodeFromTLD(tld) {
  return {
    namehash: namehash.hash(tld),
    sha3: web3.sha3(tld)
  };
}

/**
 * Deploy the ENS and ETHRegistrar
 *
 * @param {Object} deployer truffle deployer helper
 * @param {string} tld tld which the ETH registrar takes charge of
 */
async function deployRegistrar(deployer, tld) {
  var rootNode = getRootNodeFromTLD(tld);
  // Deploy the ENS first
  return deployer.deploy(ENS)
    // Deploy base registrar for tld and bind with ENS
    .then(() => deployer.deploy(BaseRegistrar, ENS.address, rootNode.namehash))
    // Deploy price oracle for tld registrar
    .then(() => deployer.deploy(DummyOracle, 1))
    .then(() => deployer.deploy(PriceOracle, DummyOracle.address, [1,2,3,4,5]))
    // Deploy the tld Registrar and bind with Base Registrar
    .then(() => deployer.deploy(
      ETHRegistrar,
      BaseRegistrar.address,
      PriceOracle.address,
      60,
      172800
    ))
    // Transfer the owner of the `rootNode` to the ETHRegistrar
    .then(() => ENS.at(ENS.address))
    .then((registry) => registry.setSubnodeOwner(
      '0x0',
      rootNode.sha3,
      ETHRegistrar.address
    ))
    .then(() => BaseRegistrar.addController(ETHRegistrar.address))
    .then(() => deployer.deploy(PublicResolver, ENS.address))
    .then(() => BaseRegistrar.setResolver(PublicResolver.address));
}


module.exports = function(deployer, network) {
  var tld = 'badass';

  deployRegistrar(deployer, tld);
};
