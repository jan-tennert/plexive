const API_URL = process.env.NEXT_PUBLIC_API_URL

export default async function Home() {
  const res = await fetch(`${API_URL}/api/interests`)
  const interests: { id: number; name: string }[] = await res.json()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Deepscroll — Connection Test</h1>
      <ul className="list-disc pl-6">
        {interests.map((i) => (
          <li key={i.id}>{i.name}</li>
        ))}
      </ul>
    </main>
  )
}
