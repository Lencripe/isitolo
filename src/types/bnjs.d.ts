declare module 'bn.js' {
  class BN {
    constructor(number: number | string | Array<number> | Uint8Array, base?: number | 'hex', endian?: 'be' | 'le')
    toArrayLike<T extends Uint8Array>(arrayType: { new(length: number): T }, endian?: 'be' | 'le', length?: number): T
    toString(base?: number | 'hex', length?: number): string
  }

  export default BN
}
