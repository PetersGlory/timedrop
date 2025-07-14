
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Market } from '@/lib/definitions';

interface BookmarkState {
  bookmarks: Market[];
  addBookmark: (market: Market) => void;
  removeBookmark: (marketId: string) => void;
}

export const useBookmarks = create<BookmarkState>()(
  persist(
    (set) => ({
      bookmarks: [],
      addBookmark: (market) =>
        set((state) => ({
          bookmarks: [...state.bookmarks, market],
        })),
      removeBookmark: (marketId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== marketId),
        })),
    }),
    {
      name: 'bookmark-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
