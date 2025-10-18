// iExec configuration for DataProtector
export const IEXEC_CONFIG = {
  // Bellecour network (iExec sidechain)
  network: {
    chainId: 134,
    rpcUrl: 'https://bellecour.iex.ec',
    name: 'bellecour'
  },
  
  // DataProtector settings
  dataProtector: {
    subgraphUrl: 'https://thegraph-product.iex.ec/subgraphs/name/bellecour/dataprotector',
    ipfsGateway: 'https://ipfs-gateway.v8-bellecour.iex.ec',
    ipfsNode: 'https://ipfs-upload.v8-bellecour.iex.ec'
  }
};
