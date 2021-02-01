module.exports = {
  networks: {
    'dev.fifs': {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
  //gas: 12024263,
	    gasPrice: 92000000000,
  //gaslimit: 500000000
    },
    'dev.auction': {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    }
  },
  compilers: {
    solc: {
      version: "0.7.4",
    }
  }
};
