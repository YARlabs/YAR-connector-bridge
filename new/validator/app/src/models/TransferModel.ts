import { ethers } from 'ethers'
import { ERC20DriverTransferToOtherChainEvent } from '../typechain-types/universal_bridge/IERC20Driver'
import { TransferToOtherChainEvent } from '../typechain-types/universal_bridge/BridgeERC20'

export class TransferModel {
  constructor(
    public readonly nonce: ethers.BigNumber,
    public readonly initialChainName: string,
    public readonly originalChainName: string,
    public readonly originalTokenAddress: string,
    public readonly targetChainName: string,
    public readonly tokenAmount: ethers.BigNumber,
    public readonly sender: string,
    public readonly recipient: string,
    public readonly tokenName: string,
    public readonly tokenSymbol: string,
    public readonly tokenDecimals: number,
  ) {}


  static fromEvent(event: TransferToOtherChainEvent) {
    return new this(
      event.args.nonce,
      event.args.initialChain,
      event.args.originalChain,
      event.args.originalTokenAddress,
      event.args.targetChain,
      event.args.tokenAmount,
      event.args.sender,
      event.args.recipient,
      event.args.tokenName,
      event.args.tokenSymbol,
      event.args.tokenDecimals,
    )
  }
}
