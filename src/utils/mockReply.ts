const replies = [
  '你好，感谢关注！请问有什么想了解的？',
  '东西还在的，欢迎咨询～',
  '价格可以再商量，你觉得多少合适？',
  '好的，我考虑一下，稍后回复你。',
  '没问题，随时可以联系我。',
  '不好意思，这个已经有人在看了，有消息我通知你。',
  '可以约个时间在图书馆门口看东西。',
  '好的，收到你的消息，谢谢！',
  '价格已经标得比较低了，暂时不议价哦。',
  '你好，这个还在的，需要的话可以约时间看看实物。',
]

let replyIndex = 0

export function getMockReply(): string {
  const reply = replies[replyIndex % replies.length]
  replyIndex++
  return reply
}

// 砍价回复
export function getBargainReply(offerPrice: number, originalPrice: number): string {
  const ratio = offerPrice / originalPrice
  if (ratio >= 0.9) {
    return `这个价格可以的，成交！我们约个时间交易吧。`
  } else if (ratio >= 0.7) {
    return `价格再稍微加点吧，${Math.round(originalPrice * 0.85)}元怎么样？`
  } else {
    return `不好意思，这个价格有点太低了，最低${Math.round(originalPrice * 0.8)}元可以吗？`
  }
}
