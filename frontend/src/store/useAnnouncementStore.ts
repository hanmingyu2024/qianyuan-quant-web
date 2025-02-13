import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Announcement {
  id: string
  title: string
  content: string
  type: 'normal' | 'important'
  time: string
  read: boolean
}

interface AnnouncementState {
  announcements: Announcement[]
  latestAnnouncement: Announcement | null
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'read'>) => void
  markAsRead: (id: string) => void
  clearAll: () => void
}

export const useAnnouncementStore = create(
  persist<AnnouncementState>(
    (set, get) => ({
      announcements: [],
      latestAnnouncement: null,
      addAnnouncement: (announcement) => {
        const newAnnouncement = {
          ...announcement,
          id: Date.now().toString(),
          read: false,
        }
        set((state) => ({
          announcements: [newAnnouncement, ...state.announcements],
          latestAnnouncement: newAnnouncement,
        }))
      },
      markAsRead: (id) =>
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, read: true } : a
          ),
          latestAnnouncement:
            state.latestAnnouncement?.id === id
              ? { ...state.latestAnnouncement, read: true }
              : state.latestAnnouncement,
        })),
      clearAll: () => set({ announcements: [], latestAnnouncement: null }),
    }),
    {
      name: 'announcements',
    }
  )
) 