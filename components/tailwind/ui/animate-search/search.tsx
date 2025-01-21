"use client";
import useChatStore from "@/hooks/chatStore";
import { useEffect, useRef, useState } from "react";
const Search = () => {
  const targetRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const showSearchInput = isHovered || isFocused;
  const { setSearchStream } = useChatStore();

  useEffect(() => {
    if (targetRef.current) {
      targetRef.current.value = "";
    }
  }, [showSearchInput]);

  return (
    <div
      className={`relative w-8 h-8 box-border rounded-full border-4 p-1transition-all duration-500 flex justify-center items-center flex-col ${
        showSearchInput
          ? "w-1/2 md:w-4/5 shadow-lg border-cyan-500"
          : "border-gray-600"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}>
      <input
        placeholder="Contents..."
        ref={targetRef}
        className={`absolute h-6 left-0 w-full text-sm rounded-lg px-5 outline-none border-none ${
          showSearchInput ? "block" : "hidden"
        }`}
        onChange={(e) => setSearchStream(e.target.value)}
        type="text"
      />
      {showSearchInput ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 16 16"
          className="h-5 w-5 text-cyan-500 self-end cursor-pointer hover:text-gray-600">
          <path d="M15.854 7.146a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L14.293 8H1.5a.5.5 0 0 1 0-1h12.793l-5.147-5.146a.5.5 0 0 1 .708-.708l6 6z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 16 16"
          className="h-5 w-5 text-cyan-500">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zm-5.241.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
        </svg>
      )}
    </div>
  );
};

export default Search;
