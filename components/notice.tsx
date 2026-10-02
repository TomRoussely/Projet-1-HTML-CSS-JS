export function Notice({
  params,
}: {
  params: { succes?: string; erreur?: string };
}) {
  return (
    <>
      {params.succes && (
        <p className="notice" role="status">
          {params.succes}
        </p>
      )}
      {params.erreur && (
        <p className="notice error" role="alert">
          {params.erreur}
        </p>
      )}
    </>
  );
}
