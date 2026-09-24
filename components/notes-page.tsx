'use client'

import { useState, useEffect } from 'react'
import { Pin, PinOff, Trash2, Edit2, Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Note, skillOptions } from '@/lib/notes-data'
import { NoteModal } from '@/components/note-modal'
import { NoteViewer } from '@/components/note-viewer'
import { AuthUser } from '@/services/auth-service'
import { getNotes, saveNote, deleteNote } from '@/services/content-service'

export function NotesPage({ user }: { user: AuthUser }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'recent-updated' | 'recent-created' | 'a-z' | 'pinned'>('recent-updated')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)

  useEffect(() => { let active=true; void getNotes(user.id).then((data)=>active&&setNotes(data)).catch(()=>{}); return ()=>{active=false} }, [user.id])

  useEffect(() => { if(typeof window!=='undefined') localStorage.setItem(`skillsprint.notes.${user.id}`, JSON.stringify(notes)) }, [notes,user.id])

  // Apply filtering and sorting
  useEffect(() => {
    let result = [...notes]

    // Filter by skill
    if (selectedSkill !== 'All') {
      result = result.filter((note) => note.skill === selectedSkill)
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term) ||
          note.topic.toLowerCase().includes(term) ||
          note.tags.some((tag) => tag.toLowerCase().includes(term))
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'pinned') {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      } else if (sortBy === 'recent-updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      } else if (sortBy === 'recent-created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === 'a-z') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

    setFilteredNotes(result)
  }, [notes, searchTerm, selectedSkill, sortBy])

  const handleCreateNote = () => {
    setEditingNote(null)
    setIsModalOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const handleSaveNote = (note: Note) => { setNotes(current => current.some(n=>n.id===note.id)?current.map(n=>n.id===note.id?note:n):[...current,note]); void saveNote(user.id,note); setIsModalOpen(false); setEditingNote(null) }

  const handleDeleteNote = (id: string) => { setNotes(notes.filter((n) => n.id !== id)); void deleteNote(user.id,id) }

  const handleTogglePin = (note: Note) => { const updated={...note,pinned:!note.pinned,updatedAt:new Date().toISOString()}; setNotes(notes.map(n=>n.id===note.id?updated:n)); void saveNote(user.id,updated) }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-400">
          <span className="size-2 rounded-full bg-sky-500" />
          Knowledge Management
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">My Notes</h2>
        <p className="mt-1 text-sm text-slate-500">Save and organize your placement preparation notes.</p>
      </div>

      {/* Create Button */}
      <Button
        onClick={handleCreateNote}
        className="rounded-xl bg-sky-600 text-xs font-semibold hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
      >
        <Plus size={14} />
        Create Note
      </Button>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes by title, content, topic, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          >
            <option value="All">All Skills</option>
            {skillOptions.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          >
            <option value="recent-updated">Recently Updated</option>
            <option value="recent-created">Recently Created</option>
            <option value="a-z">A-Z</option>
            <option value="pinned">Pinned First</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No notes found. Create your first note to get started.</p>
            <Button
              onClick={handleCreateNote}
              className="mt-4 rounded-lg bg-sky-600 text-xs font-semibold hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
            >
              <Plus size={14} />
              Create Note
            </Button>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-sky-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-500/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setViewingNote(note)}>
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">{note.title}</h3>
                    {note.pinned && <Pin size={14} className="text-amber-500" fill="currentColor" />}
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {note.skill} • {note.topic}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{note.content}</p>
                  {note.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-block rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && <span className="inline-block text-[10px] text-slate-400">+{note.tags.length - 3}</span>}
                    </div>
                  )}
                  <p className="mt-2 text-[10px] text-slate-400">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleTogglePin(note)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-amber-500 dark:hover:bg-slate-800"
                    title={note.pinned ? 'Unpin' : 'Pin'}
                  >
                    {note.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                  </button>
                  <button
                    onClick={() => handleEditNote(note)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-800"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <NoteModal
          note={editingNote}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingNote(null)
          }}
          onSave={handleSaveNote}
        />
      )}

      {viewingNote && (
        <NoteViewer
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onEdit={() => {
            setEditingNote(viewingNote)
            setViewingNote(null)
            setIsModalOpen(true)
          }}
          onDelete={() => {
            handleDeleteNote(viewingNote.id)
            setViewingNote(null)
          }}
        />
      )}
    </div>
  )
}
