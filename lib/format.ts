export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
export const duration = (minutes: number) =>
  minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60}` : ""}`;
// Initial photos ship with the project; custom Unsplash photos load remotely.
const bundledPhotos = new Set([
  "photo-1511497584788-876760111969",
  "photo-1500534623283-312aade485b7",
  "photo-1522163182402-834f871fd851",
  "photo-1441974231531-c6227db76b6e",
  "photo-1472396961693-142e6e269027",
  "photo-1473448912268-2022ce9509d8",
]);
export const photo = (id: string) =>
  id.startsWith("/photos/")
    ? id
    : bundledPhotos.has(id)
      ? `/images/${id}.jpg`
      : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;
