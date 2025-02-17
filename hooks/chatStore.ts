import { create } from "zustand";
import { z } from "zod";
import { EditorInstance } from "novel";

export type Chat = {
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

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
}

// Define the Zustand store
interface chatStore {
  // Editring
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;

  // chat box
  chatMsgs: ChatMessage[];
  addMsg: (message: ChatMessage) => void;
  updateLastAiMsg: (id: string, newContent: string) => void;
  clearChatMsgs: () => void;
  // add chat item in sidebar for pagination
  chats: Chat[];
  addChat: (item: Chat) => void; // add chat when we start conversation with ai
  resetChats: () => void;
  setChats: (chat: Chat[]) => void; // fetch Data when we have first render

  chatItemHis: HistoryType[];
  setChatItemHis: (itemHis: HistoryType) => void; // push item obj
  fetchChatItemHis: (itemHis: HistoryType[]) => void; // fetch data arr

  // Sidebar search
  searchStream: string;
  setSearchStream: (value: string) => void;

  // ai response stream
  streamData: string;
  setStreamData: (newData: string) => void;

  // editor
  editorInstance: EditorInstance | null;
  setEditorInstance: (editor: EditorInstance) => void;

  // chat status when we ask ai
  chatStarted: boolean;
  setChatStarted: (chatStarted: boolean) => void;
}

const useChatStore = create<chatStore>((set) => ({
  isEditing: false,
  setIsEditing: (isEditing: boolean) => set({ isEditing }),
  chatMsgs: [],
  addMsg: (message: ChatMessage) =>
    set((state) => {
      return { chatMsgs: [...state.chatMsgs, message] };
    }),
  updateLastAiMsg: (id, newContent) =>
    set((state) => ({
      chatMsgs: state.chatMsgs.map((msg) =>
        msg.id === id ? { ...msg, content: msg.content + newContent } : msg
      ),
    })),

  clearChatMsgs: () => set({ chatMsgs: [] }),

  chats: [],
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

  chatItemHis: [],
  setChatItemHis: (itemHis: HistoryType) =>
    set((state) => ({ chatItemHis: [...state.chatItemHis, itemHis] })),

  fetchChatItemHis: (itemHis: HistoryType[]) =>
    set(() => ({ chatItemHis: itemHis })),

  searchStream: "",
  setSearchStream: (value) => set(() => ({ searchStream: value })),

  streamData: "",
  setStreamData: (newData) => set({ streamData: newData }),

  editorInstance: null,
  setEditorInstance: (editor) => set({ editorInstance: editor }),

  chatStarted: false,
  setChatStarted: (chatStarted: boolean) => set({ chatStarted }),
}));

export default useChatStore;
