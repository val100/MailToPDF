export default function EmailProcessing() {
  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Email Processing</h2>
            <p className="text-muted-foreground">Configure and monitor email conversion jobs</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <i className="fas fa-envelope text-4xl text-muted-foreground mb-4"></i>
          <h3 className="text-lg font-semibold text-foreground mb-2">Email Processing</h3>
          <p className="text-muted-foreground">
            This page will contain detailed email processing configuration and monitoring tools.
          </p>
        </div>
      </div>
    </div>
  );
}
