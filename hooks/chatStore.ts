import { create } from "zustand";
import { z } from "zod";

type Chat = {
  created_at: string;
  session_id: string;
  content: string;
  user_question: string;
  title: string;
};

export type HistoryType = {
  content: string;
  created_at: string;
  id: number;
  model: string;
  response_id: string;
  session_id: string;
  total_tokens: string;
  type: string;
  user_question: string;
};

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

// Define a Zod schema for authentication data
const chatSchema = z.object({
  searchStream: z.string(),
  chats: z.object({
    created_at: z.string(),
    session_id: z.string(),
    content: z.string(),
    user_question: z.string(),
  }),
  histories: z.object({
    content: z.string(),
    created_at: z.string(),
    id: z.number(),
    model: z.string(),
    response_id: z.string(),
    session_id: z.string(),
    total_tokens: z.string(),
    type: z.string(),
    user_question: z.string(),
  }),
});

// Define the TypeScript type based on the schema
type chatData = z.infer<typeof chatSchema>;

// Define the Zustand store
interface chatStore {
  chats: Chat[];
  setChats: (chat: Chat[]) => void; //pagination
  chatItemHis: HistoryType[];
  setChatItemHis: (itemHis: HistoryType[]) => void;
  searchStream: string;
  setSearchStream: (value: string) => void;
  addChat: (item: Chat) => void;
  resetChats: () => void;
}

const useChatStore = create<chatStore>((set) => ({
  chats: [],
  chatItemHis: [],
  searchStream: "",
  resetChats: () => set({ chats: [] }),
  setChats: (newChats: Chat[]) =>
    set((state: { chats: Chat[] }) => {
      const updatedChats = [...state.chats, ...newChats];
      const uniqueChats = Array.from(
        new Set(updatedChats.map((chat) => chat.created_at)) // Set ensures uniqueness based on 'created_at'
      )
        .map(
          (created_at) =>
            updatedChats.find((chat) => chat.created_at === created_at) // Find the unique chats based on 'created_at'
        )
        .filter((chat): chat is Chat => chat !== undefined); // Filter out undefined values

      return { chats: uniqueChats };
    }),

  setChatItemHis: (itemHis: HistoryType[]) =>
    set((state) => ({
      chatItemHis: itemHis,
    })),

  setSearchStream: (value) => set(() => ({ searchStream: value })),
  addChat: (item: Chat) =>
    set((state) => {
      const exists = state.chats.some(
        (chat: Chat) => chat.session_id === item.session_id
      );

      // If it exists, return the current state without changes
      if (exists) {
        return state;
      }

      // Otherwise, add the new item
      return {
        chats: [...state.chats, item],
      };
    }),
}));

export default useChatStore;
