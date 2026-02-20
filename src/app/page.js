"use client";

import { useState } from "react";
import { TextInput, ActionIcon, Title } from "@mantine/core";
import { IconArrowRight, IconSearch } from '@tabler/icons-react';

export default function Home() {
  const [value, setValue] = useState('');
  const [response, setResponse] = useState(null);
  
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
        setResponse(response);

        const ids = (response.query?.search || [])
        .map(x => x.pageid)
        .join("|");

        if(!ids) return;
        
        return fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&pageids=${ids}&exintro=1&explaintext=1&format=json`)
          .then(r => r.json())
          .then(extractsResponse => {
            console.log("Extracts response:", extractsResponse);
            setExtracts(extractsResponse);
          })
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
            leftSection={<IconSearch size={18} stroke={1.5} />}
            rightSection={
              <ActionIcon 
              size={32}
              radius="xl"
              variant="filled"
              color="#212529"
              aria-label="Search"
              onClick={handleSubmit}
              >
              <IconArrowRight size={18} stroke={1.5} />
              </ActionIcon>
            }
          />
        </div>
        {response?.query?.search?.map(item => (
        <div key={item.pageid} className="flex flex-col sm:flex-col">
          <h2 className="max-w-xs text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {item.title}
          </h2>
          <p dangerouslySetInnerHTML={{ __html: item.snippet}} className="max-w-xs tracking-tight text-black dark:text-zinc-50">
          </p>
        </div>
        ))}
      </main>
    </div>
  );
}
