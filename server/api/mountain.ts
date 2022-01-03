import cheerio from "cheerio";

export default async function handleMountainRequest() {
  const res = await fetch(
    "https://fr.wikipedia.org/wiki/Barre_des_%C3%89crins"
  );
  const text = await res.text();
  const $ = cheerio.load(text);
  const descriptionElement = $(".mw-parser-output > p:nth-child(3)");
  const description = descriptionElement.text();

  return description;
}
