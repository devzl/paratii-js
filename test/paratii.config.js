import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('Paratii configuration:', function () {
  let paratii

  it('paratii.config should return the configuration with default values', async function () {
    paratii = new Paratii({
      address: address,
      privateKey: privateKey
    })

    let expected = {
      account: {
        address: address,
        privateKey: privateKey
      },
      'eth.provider': 'ws://localhost:8546',
      'eth.registryAddress': null,
      isTestNet: true
    }
    assert.deepInclude(paratii.config, expected)
  })

  it('testnet configuration should be recognized', async function () {
    paratii = new Paratii({'eth.provider': 'http://127.0.0.1:8545'})
    assert.isOk(paratii.config.isTestNet)
    paratii = new Paratii({'eth.provider': 'http://localhost:8545'})
    assert.isOk(paratii.config.isTestNet)
  })

  it('should be possible to create a second Paratii object with the same settings', async function () {
    // deploy the contracts so we have a registry address
    paratii = new Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      'eth.provider': 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })

    await paratii.eth.deployContracts()
    assert.isOk(paratii.config['eth.registryAddress'])

    let paratii2 = new Paratii({
      address: address,
      privateKey: privateKey,
      'eth.registryAddress': paratii.config['eth.registryAddress'],
      'eth.provider': 'http://localhost:8545'
    })

    // the two config's are equal, except for the reference to the Paratii object itself
    // and the paratii-repo.
    delete paratii.config.paratii
    delete paratii2.config.paratii
    delete paratii.config['ipfs.repo']
    delete paratii2.config['ipfs.repo']
    assert.deepEqual(paratii.config, paratii2.config)
  })

  it('should be possible to create a Paratii instance without an address or registryAddress', async function () {
    let paratii = new Paratii({
      'eth.provider': 'http://chain.paratii.video/'
    })
    let expected = {
      account: {
        address: null,
        privateKey: null
      },
      'eth.provider': 'http://chain.paratii.video/',
      isTestNet: false,
      'eth.registryAddress': null
    }
    assert.deepInclude(paratii.config, expected)

    let promise = paratii.eth.getContract('ParatiiToken')
    await assert.isRejected(promise, /No registry/)
  })

  it('the account should be added to the wallet if a private key is given', async function () {
    let paratii = new Paratii({
      address: address,
      privateKey: privateKey,
      'eth.provider': 'http://localhost:8545'
    })
    assert.equal(paratii.eth.web3.eth.accounts.wallet[0].address, address)
  })

  it('setAccount should set the account', async function () {
    let paratii = new Paratii({
      'eth.provider': 'http://127.0.0.1:8545'
    })
    // let beneficiary = account1
    // let amount = 0.3 * 10 ** 18
    // let promise = paratii.eth.transfer(beneficiary, amount, 'PTI')
    // assert.isRejected(promise, /No account/)
    //
    await paratii.setAccount(address, privateKey)
    assert.equal(paratii.config.account.address, address)
    assert.equal(paratii.eth.config.account.address, address)
    assert.equal(paratii.eth.web3.eth.accounts.wallet[0].address, address)
    // promise = paratii.eth.transfer(beneficiary, amount, 'PTI')
    // await assert.isFulfilled(promise)
  })

  it('paratii.eth.web3 should be available', async function () {
    let paratii = new Paratii({})
    assert.isOk(paratii.eth.web3)
  })

  it('sending transactions should work both with http as with ws providers', async function () {
    let paratii
    paratii = new Paratii({
      'eth.provider': 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContract('Registry')

    paratii = new Paratii({
      'eth.provider': 'http://localhost:8545/rpc',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContract('Registry')

    paratii = new Paratii({
      'eth.provider': 'ws://localhost:8546',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContract('Registry')
  })
})
