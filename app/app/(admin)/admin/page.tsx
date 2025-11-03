export default function AdminPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Portal</h1>
      <p className="text-gray-600 mb-8">
        Manage policy versions and monitor consent events
      </p>

      <div className="grid gap-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Policy Management</h2>
          <p className="text-gray-600">
            Create and manage policy versions for your organization
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create New Policy
          </button>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Consents</h2>
          <p className="text-gray-600">
            View recent consent events captured from your applications
          </p>
        </section>
      </div>
    </div>
  );
}
