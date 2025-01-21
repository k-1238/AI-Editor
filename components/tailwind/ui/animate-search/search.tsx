"use client";
import useChatStore from "@/hooks/chatStore";
import { useState } from "react";
const Search = () => {
  const { setSearchStream, searchStream } = useChatStore();

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex items-center" onFocus={() => setIsFocused(true)}>
      <div className="relative">
        <input
          type="text"
          className={`h-10 px-5 pr-10 rounded-full text-sm transition-all duration-300 ease-in-out ${
            isFocused || searchStream ? "w-full" : "w-12"
          }`}
          placeholder="Search..."
          onBlur={() => {
            if (!searchStream) setIsFocused(false);
          }}
          value={searchStream}
          onChange={(e) => setSearchStream(e.target.value)}
        />
        <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20">
            <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Search;
