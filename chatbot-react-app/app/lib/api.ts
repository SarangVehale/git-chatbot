const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Upload failed")
  }

  return response.json()
}

export async function sendMessage(message: string) {
  const formData = new FormData()
  formData.append("message", message)

  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to send message")
  }

  return response.json()
}


