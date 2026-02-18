"use client";

import { useState } from "react";
import { TextInput, ActionIcon, Title } from "@mantine/core";
import { IconArrowRight, IconSearch } from '@tabler/icons-react';

export default function Home() {
  const [value, setValue] = useState('');
  var url = "https://en.wikipedia.org/w/api.php"; 
  var params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: value,
    format: "json",
    origin: "*", 
});

  const handleSubmit = () => {
    fetch(`${url}?${params}`)
    .then(function(response){return response.json();})
    .then(function(response) {
        console.log("API response:", response);
    })
    .catch(function(error){console.log(error);});
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="gap-5 flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-5xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50">
            Wikipedia <br></br> Viewer.
          </h1>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <TextInput
            variant="filled"
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            size="md"
            radius="xl"
            label="Search"
            description="for a Wikipedia article."
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSubmit();
              }
            }}
            rightSection={
              <ActionIcon 
              size={32}
              radius="xl"
              variant="filled"
              aria-label="Search"
              onClick={handleSubmit}
              >
              <IconArrowRight size={18} stroke={1.5} />
              </ActionIcon>
            }
          />
        </div>
        <div className="flex flex-col sm:flex-col">
          <h2 className="max-w-xs text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Title.
          </h2>
          <p className="max-w-xs tracking-tight text-black dark:text-zinc-50">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          </p>
        </div>
      </main>
    </div>
  );
}
