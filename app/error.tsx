"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty">
      <h1>Un petit contretemps.</h1>
      <p>La page n’a pas pu être chargée. Vous pouvez réessayer.</p>
      <button className="button" onClick={reset}>
        Réessayer
      </button>
    </div>
  );
}
