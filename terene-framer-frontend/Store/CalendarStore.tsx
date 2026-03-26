// DaysCacheStore.tsx
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"

export const useCalendarStore = createStore({
    dayInfoMap: null as Map<string, any> | null,
    categoryMap: null as Map<string, string> | null,
    designMap: null as Map<string, string> | null,
})
