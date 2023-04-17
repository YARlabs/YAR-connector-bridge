import { ethers } from 'ethers'
import { ITransferModel } from '../models/TransferModel'
import { BridgeERC1155, BridgeERC1155__factory } from 'typechains'
import { EthersUtils } from 'ethers_utils'
import { AppState } from '../AppState'
import { IBatchTransferModel } from '../models/BatchTransferModel'

export class EvmExecutor {
  private readonly _provider: ethers.providers.JsonRpcProvider
  private readonly _wallet: ethers.Wallet
  private readonly _bridgeERC1155: BridgeERC1155
  private readonly _name: string
  private readonly _processName: string
  private readonly _currentChain: string

  constructor({
    name,
    processName,
    bridgeAddress,
    providerUrl,
    privateKey,
  }: {
    name: string
    processName: string
    bridgeAddress: string
    providerUrl: string
    privateKey: string
  }) {
    this._name = name
    this._processName = processName
    this._currentChain = EthersUtils.keccak256(this._name)
    this._provider = new ethers.providers.JsonRpcProvider({ url: providerUrl, timeout: 30000 })
    this._wallet = new ethers.Wallet(privateKey, this._provider)
    this._bridgeERC1155 = BridgeERC1155__factory.connect(bridgeAddress, this._wallet)
  }


  public async init() {
    const savedTrasfers = await AppState.getAwaitingTrasfers(this._currentChain, false)
    const savedBatchTrasfers = await AppState.getAwaitingBatchTrasfers(this._currentChain, false)
    await this._executeTrasfers(savedTrasfers)
    await this._executeBatchTrasfers(savedBatchTrasfers)
    setInterval(async () => {
      const transfers = await AppState.getAwaitingTrasfers(this._currentChain)
      const batchTransfers = await AppState.getAwaitingBatchTrasfers(this._currentChain)
      await this._executeTrasfers(transfers)
      await this._executeBatchTrasfers(batchTransfers)
    }, 5000)

    await AppState.setAppStatus(this._processName, 'ready')
  }

  private async _executeTrasfers(trasfers: Array<ITransferModel>) {
    const errors: Array<Error> = []
    for(const trasfer of trasfers) {
      try {
        await this._tarsferFromOtherChain(trasfer)
        await AppState.completeAwaitingTrasfer(this._currentChain, trasfer)
      } catch(e) {
        errors.push(e)
      }
    }
    if(errors.length) {
      throw Error(errors.map(e => e.message).join(' ||| '))
    }
  }

  private async _executeBatchTrasfers(trasfers: Array<IBatchTransferModel>) {
    const errors: Array<Error> = []
    for(const trasfer of trasfers) {
      try {
        await this._batchTarsferFromOtherChain(trasfer)
        await AppState.completeAwaitingBatchTrasfer(this._currentChain, trasfer)
      } catch(e) {
        errors.push(e)
      }
    }
    if(errors.length) {
      throw Error(errors.map(e => e.message).join(' ||| '))
    }
  }

  private async _tarsferFromOtherChain(transfer: ITransferModel) {
    const alreadyRegistered = await this._bridgeERC1155.registeredNonces(transfer.initialChain, transfer.nonce)
    if(alreadyRegistered) {
      console.log(`${transfer.transferId.slice(0, 8)} Already completed`)
      return
    }

    console.log(`SEND TX ${transfer.transferId.slice(0, 8)}`)
    const tx = await this._bridgeERC1155.tranferFromOtherChain(
      transfer.nonce,
      transfer.originalChain,
      transfer.originalToken,
      transfer.initialChain,
      transfer.targetChain,
      transfer.tokenId,
      transfer.amount,
      transfer.sender,
      transfer.recipient,
      transfer.tokenUri
    )
    console.log(`TX ${transfer.transferId.slice(0, 8)} SENEDED`)

    await tx.wait()
    console.log(`TX ${transfer.transferId.slice(0, 8)} COMPLETED`)
  }

  
  private async _batchTarsferFromOtherChain(transfer: IBatchTransferModel) {
    const alreadyRegistered = await this._bridgeERC1155.registeredNonces(transfer.initialChain, transfer.nonce)
    if(alreadyRegistered) {
      console.log(`${transfer.transferId.slice(0, 8)} Already completed`)
      return
    }

    console.log(`SEND TX ${transfer.transferId.slice(0, 8)}`)
    const tx = await this._bridgeERC1155.batchTranferFromOtherChain(
      transfer.nonce,
      transfer.originalChain,
      transfer.originalToken,
      transfer.initialChain,
      transfer.targetChain,
      transfer.tokenIds,
      transfer.amounts,
      transfer.sender,
      transfer.recipient,
      transfer.tokenUris,
    )
    console.log(`TX ${transfer.transferId.slice(0, 8)} SENEDED`)

    await tx.wait()
    console.log(`TX ${transfer.transferId.slice(0, 8)} COMPLETED`)
  }
}
