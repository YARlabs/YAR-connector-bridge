import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { EthersUtils } from '../utils/EthersUtils'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments

  const signers = await ethers.getSigners()
  const validator = signers[0]

  const currentChain = EthersUtils.keccak256('ETHEREUM')
  const isProxyChain = false
  const registeredChains = [
    EthersUtils.keccak256('POLYGON'),
    EthersUtils.keccak256('YAR'),
    EthersUtils.keccak256('BINANCE'),
    EthersUtils.keccak256('SKALE'),
  ]
  const IssuedERC20Deployment = await get('IssuedERC20')

  const deployment = await deploy('EthereumBridgeERC20', {
    contract: 'BridgeERC20',
    from: validator.address,
    args: [
      currentChain, // _currentChain,
      isProxyChain, // _isProxyChain,
      registeredChains, // _registeredChains,
      IssuedERC20Deployment.address, // _issuedTokenImplementation,
      validator.address, // _validator
    ],
  })
}

deploy.tags = ['EthereumBridgeERC20']
deploy.dependencies = ['IssuedERC20']
export default deploy
