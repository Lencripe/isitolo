import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useWalletConnection } from '@solana/react-hooks'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import {
  createCreatorCollectionOnchain,
  deleteCreatorCollectionOnchain,
  fetchCreatorCollections,
  loadCreatorCollections,
  saveCreatorCollections,
  type CreatorCollection,
  type CreatorCollectionCategory,
  type CreatorCollectionItem,
} from '../lib/creator-collections'
import {
  getDropMintStatsEventName,
  getMintedCountForItem,
  getRemainingSupply,
} from '../lib/drop-mint-stats'

function toId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function CreatorCollectionPage() {
  const { wallet, status } = useWalletConnection()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<CreatorCollectionCategory>('clothing')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [royaltyBps, setRoyaltyBps] = useState(500)

  const [itemTitle, setItemTitle] = useState('')
  const [itemSku, setItemSku] = useState('')
  const [itemPriceUsdc, setItemPriceUsdc] = useState(25)
  const [itemSupply, setItemSupply] = useState(100)
  const [items, setItems] = useState<CreatorCollectionItem[]>([])

  const [savedCollections, setSavedCollections] = useState<CreatorCollection[]>(() => loadCreatorCollections())
  const [message, setMessage] = useState('')
  const [mintStatsVersion, setMintStatsVersion] = useState(0)

  const itemCount = useMemo(() => items.length, [items])

  useEffect(() => {
    let cancelled = false

    const hydrateCollections = async () => {
      const collections = await fetchCreatorCollections()
      if (!cancelled) {
        setSavedCollections(collections)
      }
    }

    void hydrateCollections()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const eventName = getDropMintStatsEventName()
    const handleMintStatsUpdate = () => {
      setMintStatsVersion((value) => value + 1)
    }

    window.addEventListener(eventName, handleMintStatsUpdate)
    window.addEventListener('storage', handleMintStatsUpdate)
    return () => {
      window.removeEventListener(eventName, handleMintStatsUpdate)
      window.removeEventListener('storage', handleMintStatsUpdate)
    }
  }, [])

  const addItem = (event: FormEvent) => {
    event.preventDefault()
    setMessage('')

    if (!itemTitle.trim()) {
      setMessage('Please enter an item title before adding it.')
      return
    }

    const item: CreatorCollectionItem = {
      id: `${toId(itemTitle)}-${Date.now().toString(36)}`,
      title: itemTitle.trim(),
      sku: itemSku.trim() || toId(itemTitle),
      basePriceUsdc: Number(itemPriceUsdc),
      maxSupply: Number(itemSupply),
    }

    setItems((prev) => [...prev, item])
    setItemTitle('')
    setItemSku('')
    setItemPriceUsdc(25)
    setItemSupply(100)
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const resolveWalletSignerProvider = (walletAddress: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any
    const availableProviders = [
      win.backpack,
      win.solana,
      win.solflare,
      win.coinbaseSolana,
    ]

    return (
      availableProviders.find((provider) => provider?.publicKey?.toString?.() === walletAddress)
      || availableProviders.find((provider) => provider?.signTransaction)
    )
  }

  const removeCollection = async (collection: CreatorCollection) => {
    setMessage('')

    const localNext = savedCollections.filter((entry) => entry.id !== collection.id)

    if (!wallet || status !== 'connected') {
      setSavedCollections(localNext)
      saveCreatorCollections(localNext)
      setMessage('Collection removed locally. Connect wallet to remove it on-chain too.')
      return
    }

    const walletAddress = wallet.account.address.toString()
    const signerProvider = resolveWalletSignerProvider(walletAddress)
    if (!signerProvider?.signTransaction) {
      setSavedCollections(localNext)
      saveCreatorCollections(localNext)
      setMessage('Collection removed locally. Could not resolve wallet signer provider for on-chain removal.')
      return
    }

    try {
      const { signature } = await deleteCreatorCollectionOnchain({
        collectionId: collection.id,
        ownerAddress: walletAddress,
        signerProvider,
      })

      const onchainCollections = await fetchCreatorCollections()
      const next = onchainCollections.filter((entry) => entry.id !== collection.id)
      setSavedCollections(next)
      saveCreatorCollections(next)
      setMessage(`Collection removed from website and chain. Tx: ${signature}`)
    } catch (error) {
      setSavedCollections(localNext)
      saveCreatorCollections(localNext)
      setMessage(
        `On-chain removal failed, removed locally instead: ${(error as Error)?.message || 'Unknown error'}`
      )
    }
  }

  const saveCollection = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')

    if (!name.trim()) {
      setMessage('Collection name is required.')
      return
    }

    if (!description.trim()) {
      setMessage('Collection description is required.')
      return
    }

    if (items.length === 0) {
      setMessage('Add at least one item to the collection.')
      return
    }

    if (!wallet || status !== 'connected') {
      setMessage('Connect your wallet to create a collection on-chain.')
      return
    }

    const v1Address = wallet.account.address.toString()
    const signerProvider = resolveWalletSignerProvider(v1Address)

    if (!signerProvider?.signTransaction) {
      setMessage('Unable to resolve a wallet signer provider. Please reconnect your wallet.')
      return
    }

    const collection: CreatorCollection = {
      id: `${toId(name)}-${Date.now().toString(36)}`,
      name: name.trim(),
      category,
      description: description.trim(),
      coverImageUrl: coverImageUrl.trim(),
      royaltyBps: Number(royaltyBps),
      createdAt: new Date().toISOString(),
      items,
      authority: v1Address,
    }

    try {
      const { signature } = await createCreatorCollectionOnchain({
        collection,
        ownerAddress: v1Address,
        signerProvider,
      })

      const onchainCollections = await fetchCreatorCollections()
      const next = onchainCollections.length > 0 ? onchainCollections : [collection, ...savedCollections]
      setSavedCollections(next)
      saveCreatorCollections(next)

      setName('')
      setCategory('clothing')
      setDescription('')
      setCoverImageUrl('')
      setRoyaltyBps(500)
      setItems([])
      setMessage(`Collection saved on-chain. Tx: ${signature}`)
    } catch (error) {
      const fallback = [collection, ...savedCollections]
      saveCreatorCollections(fallback)
      setSavedCollections(fallback)
      setMessage(
        `On-chain save failed, stored locally instead: ${(error as Error)?.message || 'Unknown error'}`
      )
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Creator Studio</h1>
        <p className="text-muted-foreground mb-8">
          Create collections for clothing drops or printable artwork editions.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card>
            <form className="p-6 space-y-4" onSubmit={saveCollection}>
              <h2 className="text-2xl font-bold">New Collection</h2>

              <div>
                <label className="block text-sm font-medium mb-1">Collection Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                  placeholder="Summer Graphic Tees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Collection Type</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as CreatorCollectionCategory)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                >
                  <option value="clothing">Clothing</option>
                  <option value="printable_artworks">Printable Artworks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 min-h-24"
                  placeholder="Limited print-run of recyclable cotton pieces with matching artwork certificates."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cover Image URL</label>
                  <input
                    value={coverImageUrl}
                    onChange={(event) => setCoverImageUrl(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Royalty (BPS)</label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={royaltyBps}
                    onChange={(event) => setRoyaltyBps(Number(event.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </div>
              </div>

              <Card className="bg-muted/40">
                <div className="p-4">
                  <h3 className="font-semibold mb-3">Add Collection Items</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      value={itemTitle}
                      onChange={(event) => setItemTitle(event.target.value)}
                      className="rounded-md border border-border bg-background px-3 py-2"
                      placeholder="Item title"
                    />
                    <input
                      value={itemSku}
                      onChange={(event) => setItemSku(event.target.value)}
                      className="rounded-md border border-border bg-background px-3 py-2"
                      placeholder="SKU (optional)"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={itemPriceUsdc}
                      onChange={(event) => setItemPriceUsdc(Number(event.target.value))}
                      className="rounded-md border border-border bg-background px-3 py-2"
                      placeholder="Base price (USDC)"
                    />
                    <input
                      type="number"
                      min={1}
                      value={itemSupply}
                      onChange={(event) => setItemSupply(Number(event.target.value))}
                      className="rounded-md border border-border bg-background px-3 py-2"
                      placeholder="Max supply"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={addItem}>
                    Add Item
                  </Button>

                  {items.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.sku} · {item.basePriceUsdc} USDC · Supply {item.maxSupply}
                            </p>
                          </div>
                          <Button type="button" size="sm" variant="ghost" onClick={() => removeItem(item.id)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Card>

              {message ? (
                <p className="text-sm text-emerald-300 break-all">{message}</p>
              ) : null}

              <Button type="submit" className="w-full">
                Save Collection ({itemCount} item{itemCount === 1 ? '' : 's'})
              </Button>
            </form>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Saved Collections</h2>
              {savedCollections.length === 0 ? (
                <p className="text-muted-foreground">No collections yet. Create your first one on the left.</p>
              ) : (
                <div className="space-y-4" key={`mint-stats-${mintStatsVersion}`}>
                  {savedCollections.map((collection) => (
                    <Card key={collection.id} className="bg-muted/40">
                      <div className="p-4">
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <h3 className="font-bold text-lg">{collection.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-primary/15 text-primary">
                              {collection.category === 'clothing' ? 'Clothing' : 'Printable Artworks'}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => void removeCollection(collection)}
                            >
                              Remove Drop
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{collection.description}</p>
                        <p className="text-xs text-muted-foreground mb-1">Items: {collection.items.length}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          Minted: {collection.items.reduce((sum, item) => sum + getMintedCountForItem(item.id), 0)} /
                          {' '}
                          {collection.items.reduce((sum, item) => sum + item.maxSupply, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          Left: {collection.items.reduce((sum, item) => sum + getRemainingSupply(item.id, item.maxSupply), 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">Royalty: {collection.royaltyBps} bps</p>
                        <div className="mt-2 space-y-1">
                          {collection.items.map((item) => {
                            const minted = getMintedCountForItem(item.id)
                            const remaining = getRemainingSupply(item.id, item.maxSupply)
                            return (
                              <p key={item.id} className="text-xs text-muted-foreground">
                                {item.title}: {minted}/{item.maxSupply} minted · {remaining} left
                              </p>
                            )
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">Created: {new Date(collection.createdAt).toLocaleString()}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
