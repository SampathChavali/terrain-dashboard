import { Download, FileUp, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { BoardState } from '../types'
import {
  buildTaskReport,
  downloadCsvReport,
  downloadJsonReport,
  importBoardFromFile,
} from '../utils/taskReport'

interface ImportDataModalProps {
  open: boolean
  username: string
  state: BoardState
  onClose: () => void
  onImport: (data: Partial<BoardState>) => void
}

export function ImportDataModal({
  open,
  username,
  state,
  onClose,
  onImport,
}: ImportDataModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')

  if (!open) return null

  const report = buildTaskReport(state.tasks)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    setImportSuccess('')
    importBoardFromFile(
      file,
      (data) => {
        onImport(data)
        setImportSuccess('Data imported successfully.')
      },
      (msg) => setImportError(msg),
    )
    e.target.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="card w-full max-w-4xl max-h-[90vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-elevated cursor-pointer"
        >
          <X className="w-4 h-4 text-muted" />
        </button>

        <h2 className="text-lg font-bold text-text mb-1">Task Data Report</h2>
        <p className="text-sm text-muted mb-4">
          Full timeline for each task — created, in progress, duration, and completion dates.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => downloadCsvReport(state.tasks, username)}
            className="btn-primary text-xs py-1.5 px-3"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
          <button
            onClick={() => downloadJsonReport(state, username)}
            className="btn-outline text-xs py-1.5 px-3"
          >
            <Download className="w-3.5 h-3.5" />
            Download JSON
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-outline text-xs py-1.5 px-3"
          >
            <Upload className="w-3.5 h-3.5" />
            Import JSON backup
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
        </div>

        {importError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            {importError}
          </p>
        )}
        {importSuccess && (
          <p className="text-sm text-green-primary bg-green-bg border border-green-pale rounded-lg px-3 py-2 mb-3">
            {importSuccess}
          </p>
        )}

        <div className="flex-1 min-h-0 overflow-auto border border-green-pale rounded-xl">
          {report.length === 0 ? (
            <p className="text-sm text-muted text-center py-12">No tasks yet. Create tasks to see the report.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-elevated sticky top-0">
                <tr className="text-left text-muted">
                  <th className="p-2 font-semibold">Task</th>
                  <th className="p-2 font-semibold">Status</th>
                  <th className="p-2 font-semibold">Created</th>
                  <th className="p-2 font-semibold">In Progress</th>
                  <th className="p-2 font-semibold">Time In Progress</th>
                  <th className="p-2 font-semibold">Completed</th>
                  <th className="p-2 font-semibold">Files</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row) => (
                  <tr key={row.key} className="border-t border-border hover:bg-card-hover">
                    <td className="p-2">
                      <p className="font-semibold text-text">{row.key}</p>
                      <p className="text-muted truncate max-w-[140px]">{row.title}</p>
                    </td>
                    <td className="p-2 text-text">{row.status}</td>
                    <td className="p-2 text-muted whitespace-nowrap">{row.createdAt}</td>
                    <td className="p-2 text-muted whitespace-nowrap">{row.inProgressAt}</td>
                    <td className="p-2 text-green-primary font-medium">{row.daysInProgress}</td>
                    <td className="p-2 text-muted whitespace-nowrap">{row.completedAt}</td>
                    <td className="p-2 text-center">{row.linkedFiles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-start gap-2 text-[11px] text-muted bg-elevated rounded-lg p-3">
          <FileUp className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            CSV includes all task dates and durations. JSON backup includes full task data, daily
            updates, linked files, and status history for restore.
          </p>
        </div>
      </div>
    </div>
  )
}
