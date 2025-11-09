// Utility functions for the application

// Validate userID: alphanumeric, 3-20 characters
export function validateUserID(userID: string): boolean {
  const userIDRegex = /^[a-zA-Z0-9_]{3,20}$/
  return userIDRegex.test(userID)
}

// Extract mentions from text (@username)
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }
  return [...new Set(mentions)] // Remove duplicates
}

// Extract hashtags from text (#hashtag)
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g
  const hashtags: string[] = []
  let match
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1])
  }
  return [...new Set(hashtags)] // Remove duplicates
}

// Extract URLs from text
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls: string[] = []
  let match
  while ((match = urlRegex.exec(text)) !== null) {
    urls.push(match[1])
  }
  return urls
}

// Calculate character count for post (links count as 23, hashtags/mentions don't count)
export function calculatePostLength(text: string): number {
  const urls = extractUrls(text)
  const mentions = extractMentions(text)
  const hashtags = extractHashtags(text)
  
  // Remove hashtags and mentions from text for counting
  let textWithoutSpecial = text
  mentions.forEach(mention => {
    textWithoutSpecial = textWithoutSpecial.replace(new RegExp(`@${mention}`, 'g'), '')
  })
  hashtags.forEach(hashtag => {
    textWithoutSpecial = textWithoutSpecial.replace(new RegExp(`#${hashtag}`, 'g'), '')
  })
  
  // Count remaining characters + 23 per URL
  const baseLength = textWithoutSpecial.replace(/\s+/g, ' ').trim().length
  const urlLength = urls.length * 23
  
  return baseLength + urlLength
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}秒前`
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分鐘前`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}小時前`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays}天前`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
  
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

