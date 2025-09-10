export default function Settings() {
  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
            <p className="text-muted-foreground">Configure application preferences and Office 365 integration</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <i className="fas fa-cog text-4xl text-muted-foreground mb-4"></i>
          <h3 className="text-lg font-semibold text-foreground mb-2">Settings</h3>
          <p className="text-muted-foreground">
            This page will contain application settings, Office 365 configuration, and PDF output preferences.
          </p>
        </div>
      </div>
    </div>
  );
}
