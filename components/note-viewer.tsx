'use client'

import { X, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Note } from '@/lib/notes-data'

interface NoteViewerProps {
  note: Note
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export function NoteViewer({ note, onClose, onEdit, onDelete }: NoteViewerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold text-slate-900 dark:text-slate-100">{note.title}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {note.skill} • {note.topic}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Meta Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Created</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{new Date(note.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Updated</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{new Date(note.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Tags</p>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span key={tag} className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Note Content */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Note</p>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900 dark:text-slate-100">{note.content}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800">
          <Button onClick={onDelete} variant="outline" className="rounded-lg text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300">
            <Trash2 size={16} />
            Delete
          </Button>
          <Button onClick={onClose} variant="outline" className="rounded-lg">
            Close
          </Button>
          <Button onClick={onEdit} className="rounded-lg bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600">
            <Edit2 size={16} />
            Edit
          </Button>
        </div>
      </div>
    </div>
  )
}
