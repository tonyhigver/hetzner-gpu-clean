export default function ServerDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-10 text-center text-white">
      <h1 className="text-4xl font-bold mb-4">Servidor: {params.id}</h1>
      <div className="bg-black text-green-400 p-6 rounded-lg font-mono">
        <p>TERMINAL</p>
        <p className="mt-2 text-sm text-gray-400">(aquí irá la terminal)</p>
      </div>
    </div>
  );
}
