export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-gray-600 mb-4">
          Admin settings. Change password and profile options will be available here in a future update.
        </p>
        <p className="text-sm text-gray-500">
          You are currently logged in. Use Logout in the top bar to sign out.
        </p>
      </div>
    </div>
  );
}
