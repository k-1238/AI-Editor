"use client";
import useChatStore from "@/hooks/chatStore";
import { Input } from "../input";
import { SearchIcon } from "lucide-react";
const Search = () => {
  const { setSearchStream, searchStream } = useChatStore();

  return (
    <div className="relative flex items-center w-full">
      <Input value={searchStream} placeholder="Search..." type="text" onChange={(e) => setSearchStream(e.target.value)} icon={<SearchIcon />} onIconClick={() => setSearchStream(searchStream)} />
    </div>
  );
};

export default Search;
