
const DataTable = ({ columns, data, emptyMessage = "Tidak ada data yang ditemukan" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full py-xl text-center text-on-surface-variant/70 bg-surface-variant rounded-xl border border-outline">
        <p className="font-body-md text-body-md m-0">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-outline bg-surface-variant backdrop-blur-md">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-outline bg-surface">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className="px-md py-sm font-label-lg text-label-lg text-on-surface dark:text-white whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="border-b border-outline last:border-0 hover:bg-surface-variant transition-colors"
            >
              {columns.map((col, colIndex) => (
                <td 
                  key={colIndex} 
                  className="px-md py-sm font-body-md text-body-md text-on-surface-variant dark:text-white/80"
                >
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
