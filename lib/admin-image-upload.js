export async function uploadAdminImage(endpoint, file) {
  const formData = new FormData();
  formData.append("image", file);

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Image upload failed because the server is unavailable.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `The upload service returned an invalid response (HTTP ${response.status}).`
    );
  }

  if (
    !response.ok ||
    data?.success !== true ||
    typeof data?.imageUrl !== "string" ||
    !data.imageUrl.startsWith("https://")
  ) {
    throw new Error(data?.message || "Unable to upload the image.");
  }

  return data.imageUrl;
}
