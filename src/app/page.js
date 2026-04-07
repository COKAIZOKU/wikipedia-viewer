"use client";

import { useState } from "react";
import { TextInput, ActionIcon, Button, Loader } from "@mantine/core";
import { IconArrowRight, IconSearch, IconExternalLink} from '@tabler/icons-react';

export default function Home() {
  const [value, setValue] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false); // idk if im going to use it
  const [data, setData] = useState(null);
  
  var url = "https://en.wikipedia.org/w/api.php"; 
  var params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: value,
    format: "json",
    origin: "*", 
  });

  const handleSubmit = () => {
    setLoading(true);

    fetch(`${url}?${params}`)
    .then(function(response){return response.json();})
    .then(function(response) {

        console.log("API response:", response);
        setResponse(response);
        setData(response);

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
    .catch(function(error){console.log(error);})
    .finally(() => {
      setLoading(false);
    });
  }
  const handleClick = (title) => {
    const articleUrl = 
    "https://en.wikipedia.org/wiki/" +
        encodeURIComponent(title.replace(/ /g, "_"));
    window.open(articleUrl, "_blank", "noopener,noreferrer");
  }

  var paramsRandom = {
    action: "query",
    format: "json",
    rnlimit: "1",
    list: "random",
    rnnamespace: "0",
  }

  var urlRandom = url + "?origin=*";
  Object.keys(paramsRandom).forEach(function(key){urlRandom += "&" + key + "=" + paramsRandom[key];});
  const handleRandom = () => {
    fetch(urlRandom)
    .then(function(responseRandom){return responseRandom.json();})
    .then(function(responseRandom) {
      var randoms = responseRandom.query.random;
      console.log(responseRandom)
      const title = randoms[0].title;
      const randomUrl =
        "https://en.wikipedia.org/wiki/" +
        encodeURIComponent(title.replace(/ /g, "_"));
      window.open(randomUrl, "_blank", "noopener,noreferrer");
    })
    .catch(function(error){console.log(error)})
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans dark:bg-black">
      <main className="gap-2 flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center items-start text-left w-full">
          <h1 className="mb-3 text-5xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50 w-full">
            Wikipedia <br></br> Viewer.
          </h1>
        </div>
        <div className="grid grid-cols-12 flex flex-col gap-4 sm:flex-row w-full">
          <div className="col-span-8">
          <TextInput
            w="100%"
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
          <div className="col-span-4 mt-auto">
          <Button onClick={handleRandom} color="#212529" size="md" className="mt-auto" variant="filled" radius="xl" fullWidth>Random Article</Button>
          </div>
        </div>
        {data && 
        <p className="flex flex-col w-full text-zinc-400 text-sm">Found {data.query?.search?.length || 0} {data.query?.search?.length === 1 ? "article" : "articles"}. </p>
        }
        {response?.query?.search?.map(item => {
        const articleUrl =
          "https://en.wikipedia.org/wiki/" + encodeURIComponent(item.title.replace(/ /g, "_"));
        return (
        <div key={item.pageid} className="gap-1 mb-6 flex flex-col sm:flex-col w-full">
          <p className="text-2xl font-semibold tracking-tight text-black w-full">
              {item.title}
          </p>
          <p dangerouslySetInnerHTML={{ __html: item.snippet}} className="text-md tracking-tight text-black dark:text-zinc-50 w-full">
          </p>
            <Button justify="space-between" rightSection={ <IconExternalLink size={14} />}  onClick={() => handleClick(item.title)} variant="light" color="gray" size="xs" radius="xs">{articleUrl}</Button>
        </div>
        )})}
      </main>
    </div>
  );
}
