const text = `<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { margin: 0; }
  </style>
  <style type="text/css">
    .foo { color: red; }
  </style>
</head>
<body>
  <h1>Hello</h1>
</body>
</html>`;
const clean = text
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<[^>]*>/gm, '')
  .replace(/&[a-z]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();
console.log(clean);
