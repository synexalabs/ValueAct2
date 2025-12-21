import React from 'react'

const ResultTable = ({
  columns,
  data,
  loading = false,
  className = '',
  fixedColumn,
  emptyMessage = 'No data available'
}) => {
  if (loading) {
    return (
      <div className={`card p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                {columns.map((_, j) => (
                  <div key={j} className="h-3 bg-gray-200 rounded flex-1"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={`card p-4 text-center ${className}`}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`card p-4 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  } ${fixedColumn === column.key ? 'sticky left-0 bg-white z-10' : ''}`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 transition-colors duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3 py-2 text-sm text-gray-900 ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    } ${fixedColumn === column.key ? 'sticky left-0 bg-white z-10 font-medium' : ''}`}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResultTable
