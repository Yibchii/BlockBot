const imageBaseUrl = import.meta.env.DEV
  ? "/static/images"
  : "/static/frontend/images";

export function imageUrl(filename) {
  return `${imageBaseUrl}/${filename}`;
}
