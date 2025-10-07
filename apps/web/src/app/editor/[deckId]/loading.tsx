// GUARDRAIL: Code splitting - editor heavy deps load separately
export default function EditorLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading editor...</p>
      </div>
    </div>
  );
}

