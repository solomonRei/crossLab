import { clsx } from "clsx"

export function cn(...inputs) {
  return clsx(inputs)
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatProgress(progress) {
  return Math.round(progress * 100)
}

export function getAvatarFallback(firstName, lastName) {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  }
  if (lastName) {
    return lastName.slice(0, 2).toUpperCase();
  }
  return 'U';
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
} 