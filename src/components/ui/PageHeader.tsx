interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 bg-white">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 ml-4">
          {actions}
        </div>
      )}
    </div>
  )
}