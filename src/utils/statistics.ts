import type { Item, ItemType } from '@/types'

export interface TypeStat {
  name: string
  value: number
}

export interface CampusStat {
  name: string
  value: number
}

export interface StatusStat {
  name: string
  value: number
}

const typeLabels: Record<ItemType, string> = {
  secondhand: '二手交易',
  lostfound: '失物招领',
  group: '拼单搭子',
  errand: '跑腿委托',
}

export function calcTypeDistribution(items: Item[]): TypeStat[] {
  const map = new Map<string, number>()
  items.forEach((item) => {
    const label = typeLabels[item.type] || item.type
    map.set(label, (map.get(label) || 0) + 1)
  })
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}

export function calcCampusDistribution(items: Item[]): CampusStat[] {
  const map = new Map<string, number>()
  items.forEach((item) => {
    map.set(item.campus, (map.get(item.campus) || 0) + 1)
  })
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}

export function calcStatusDistribution(items: Item[]): StatusStat[] {
  const map = new Map<string, number>()
  items.forEach((item) => {
    map.set(item.status, (map.get(item.status) || 0) + 1)
  })
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}

export function calcHotItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5)
}

export function calcRecentItems(items: Item[]): Item[] {
  return [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
}
