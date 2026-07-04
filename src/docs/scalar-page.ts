export function getScalarDocsHtml(openApiUrl = '/openapi.json'): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <title>Kratom Finance API</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url="${openApiUrl}"
      data-theme="purple"
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
}
