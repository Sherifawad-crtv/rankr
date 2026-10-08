export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-medium text-text-primary">{title}</h1>
      {description && <p className="mt-1 text-base text-text-secondary">{description}</p>}
    </div>
  );
}
