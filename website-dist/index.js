var counterContainer = document.querySelector(".website-counter");

async function getapi() {
  const response = await fetch(
    "https://noc1qi04ah.execute-api.us-east-2.amazonaws.com/prod/visits",
    {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "no-cors",
    }
  );
  console.log(response);
  const myjson = await response.json();
  console.log(myjson);
  const visits = myjson.visits;

  return visits;
}

async function updateCounter() {
  const visits = await getapi();
  counterContainer.innerHTML = visits;
}

updateCounter();
