"use server"

export async function uploadDocument(formData: FormData) {
  const file = formData.get("file") as File

  if (!file) {
    throw new Error("No file provided")
  }

  // Here you would integrate with your Python backend
  // For now, we'll just return a success message
  return {
    success: true,
    message: `Document ${file.name} uploaded successfully`,
  }
}

export async function sendMessage(formData: FormData) {
  const message = formData.get("message") as string

  if (!message) {
    throw new Error("No message provided")
  }

  // Here you would integrate with your Python backend
  // For now, we'll simulate a response
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    role: "assistant",
    content: `This is a simulated response to: ${message}`,
  }
}


