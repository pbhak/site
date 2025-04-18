const repo1 = document.getElementById("repo1");
const repo2 = document.getElementById("repo2");
const repo3 = document.getElementById("repo3");

const defaultColorScheme = localStorage.getItem("theme") ?? "gruvbox";
let rateLimited = false;

function formatDate(date) {
  const month = date.getMonth() + 1;
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  if (day == new Date().getDate()) {
    return "today";
  } else if (day == new Date().getDate() - 1) {
    return "yesterday";
  } else {
    return `${month}/${day}/${year}`;
  }
}

function addLinkElement(repoId) {
  const listElement = document.createElement("li");
  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", reposJson[repoId].html_url);
  linkElement.innerText = reposJson[repoId].description;
  listElement.appendChild(linkElement);
  listElement.append(
    ` (last pushed ${formatDate(new Date(reposJson[repoId].pushed_at))})`
  );
  document.getElementById("repo-list").appendChild(listElement);
}

function setDefaultColorScheme() {
  document.getElementById("color-changer").value = defaultColorScheme;
  fetch("./color_schemes.json")
    .then((response) => response.json())
    .then((data) => changeColorScheme(data[defaultColorScheme]));
}

function changeColorScheme(colorSchemeObject) {
  // Change page background color
  localStorage.setItem("theme", document.getElementById("color-changer").value);
  console.log(`${document.getElementById("color-changer").value} written to localStorage`)
  document.getElementsByTagName("body")[0].style.backgroundColor =
    colorSchemeObject.background;
  // Change foreground color
  document
    .querySelectorAll("h1, p, li, a")
    .forEach((element) => (element.style.color = colorSchemeObject.foreground));
  document.getElementById("color-changer").style.backgroundColor =
    colorSchemeObject.background;
  document.getElementById("color-changer").style.color =
    colorSchemeObject.foreground;
  // If the color scheme specifies colors for the head <h1> element and the <hr> elements, apply them
  if (colorSchemeObject.header)
    document.getElementById("head").style.color = colorSchemeObject.header;
  if (colorSchemeObject.hr) {
    for (
      let elementIndex = 0;
      elementIndex < document.getElementsByTagName("hr").length;
      elementIndex++
    ) {
      document.getElementsByTagName("hr")[elementIndex].style.borderColor =
        colorSchemeObject.hr;
    }
  }
  // Change color of links, but only if the type of link to change is in the document
  if (document.querySelector("a:link"))
    document
      .querySelectorAll("a:link")
      .forEach(
        (element) => (element.style.color = colorSchemeObject.link.regular)
      );
  if (document.querySelector("a:visited"))
    document
      .querySelectorAll("a:visited")
      .forEach(
        (element) => (element.style.color = colorSchemeObject.link.visited)
      );
  // Change color of all elements with the secondary class to the secondary color specified
  for (
    let elementIndex = 0;
    elementIndex < document.getElementsByClassName("secondary").length;
    elementIndex++
  ) {
    document.getElementsByClassName("secondary")[elementIndex].style.color =
      colorSchemeObject.secondary;
  }
}

// Update age and year based on...age and year
const age = new Date(new Date() - new Date("7/17/2010")).getFullYear() - 1970;

document.getElementById("age").innerText = age;

switch (age) {
  case 14:
  case 18:
    document.getElementById("year").innerText = "freshman";
    break;
  case 15:
  case 19:
    document.getElementById("year").innerText = "sophomore";
    break;
  case 16:
  case 20:
    document.getElementById("year").innerText = "junior";
    break;
  case 17:
  case 21:
    document.getElementById("year").innerText = "senior";
    break;
}

// Fetch all repositories I own, then use a custom sorting function to sort them by last pushed.
const repos = await fetch("https://api.github.com/users/pbhak/repos");
const reposJson = await repos.json().then((json) => {
  try {
    json.sort((repoA, repoB) => {
      repoA = new Date(repoA.pushed_at);
      repoB = new Date(repoB.pushed_at);

      return repoA > repoB ? -1 : 1;
    });

    return json;
  } catch {
    rateLimited = true;
  }
});

if (rateLimited) {
  const limited = document.createElement("li");
  limited.innerText =
    "..well, this is awkward. it looks like you just got rate limited by github. how odd.";
  document.getElementById("repo-list").appendChild(limited);
} else {
  // Take the latest 3 repositories I've pushed to and format them on the site
  addLinkElement(0);
  addLinkElement(1);
  addLinkElement(2);
}

setDefaultColorScheme();

// Change color scheme based on the value of the #color-changer dropdown
document.getElementById("color-changer").onchange = function () {
  const colorScheme = this.value;

  fetch("./color_schemes.json")
    .then((response) => response.json())
    .then((data) => {
      if (!(colorScheme in data)) return;
      changeColorScheme(data[colorScheme]);
    })
    .catch((error) => console.error(`Error switching color schemes: ${error}`));
};

// Update Hack Club handle based on whether or not I'm online
await fetch("https://stats.pbhak.hackclub.app/online")
  .then((response) => response.json())
  .then((data) => {
    if (data)
      document.getElementById("slack-presence").innerText =
        " (currently online!)";
  });
