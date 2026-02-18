var url = "https://en.wikipedia.org/w/api.php"; 

var params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: "Nelson Mandela",
    format: "json",
    origin: location.origin
});

fetch(`${url}?${params}`)
    .then(function(response){return response.json();})
    .then(function(response) {
        if (response.query.search[0].title === "Nelson Mandela"){
            console.log("Your search page 'Nelson Mandela' exists on English Wikipedia" );
        }
    })
    .catch(function(error){console.log(error);});