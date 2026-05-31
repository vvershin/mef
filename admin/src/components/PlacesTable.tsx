import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { Place, PLACE_CATEGORY_LABELS } from '../../../shared/types';
import { Edit2, Trash2, Star } from 'lucide-react';

interface PlacesTableProps {
  places: Place[];
  onEdit: (place: Place) => void;
  onDelete: (id: number) => void;
  onToggleFeatured: (id: number) => void;
}

const columnHelper = createColumnHelper<Place>();

export const PlacesTable: React.FC<PlacesTableProps> = ({
  places,
  onEdit,
  onDelete,
  onToggleFeatured,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: info => info.getValue(),
        size: 60,
      }),
      columnHelper.accessor('title', {
        header: 'Название',
        cell: info => (
          <div className="max-w-xs truncate font-medium" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('category', {
        header: 'Категория',
        cell: info => <span className="text-sm">{PLACE_CATEGORY_LABELS[info.getValue()]}</span>,
      }),
      columnHelper.accessor('address', {
        header: 'Адрес',
        cell: info => (
          <div className="max-w-xs truncate" title={info.getValue() || ''}>
            {info.getValue() || '-'}
          </div>
        ),
      }),
      columnHelper.accessor('url', {
        header: 'Ссылка',
        cell: info => info.getValue()
          ? <a href={info.getValue()} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate max-w-xs block">ссылка</a>
          : '-',
      }),
      columnHelper.accessor('isFeatured', {
        header: '⭐',
        cell: info => (
          <button
            onClick={() => onToggleFeatured(info.row.original.id)}
            className={`p-1 rounded ${info.getValue() ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            <Star size={18} fill={info.getValue() ? 'currentColor' : 'none'} />
          </button>
        ),
        size: 50,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Действия',
        cell: props => {
          const place = props.row.original;
          return (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(place)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Редактировать"
              >
                <Edit2 size={16} className="text-blue-600" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Удалить место "${place.title}"?`)) {
                    onDelete(place.id);
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Удалить"
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            </div>
          );
        },
        size: 100,
      }),
    ],
    [onEdit, onDelete, onToggleFeatured]
  );

  const table = useReactTable({
    data: places,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {places.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Нет мест. Создайте первое место!
        </div>
      )}
    </div>
  );
};
