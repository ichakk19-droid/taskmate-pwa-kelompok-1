import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  ClipboardList,
  Clock,
  BookOpen,
  X,
  Sun,
  Moon
} from 'lucide-react'

function App() {

  const tasks = useLiveQuery(
    () => db.tasks.orderBy('createdAt').reverse().toArray(),
    []
  ) || []

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // DARK MODE DAN LIGHT MODE
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)

    localStorage.setItem(
      'theme',
      darkMode ? 'dark' : 'light'
    )
  }, [darkMode])

  // Ganti tema
  const toggleTheme = () => {
    setDarkMode(prev => !prev)
  }

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Kuliah',
    dueDate: ''
  })

  // Statistik
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pending = total - completed

  // Input form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // Simpan tugas
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      alert('Nama tugas wajib diisi!')
      return
    }

    if (editingId !== null) {
      await db.tasks.update(editingId, {
        ...form,
        title: form.title.trim()
      })
    } else {
      await db.tasks.add({
        ...form,
        title: form.title.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      })
    }

    resetForm()
  }

  // Reset form
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: 'Kuliah',
      dueDate: ''
    })

    setEditingId(null)
    setShowForm(false)
  }

  // Edit tugas
  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      category: task.category || 'Kuliah',
      dueDate: task.dueDate || ''
    })

    setEditingId(task.id)
    setShowForm(true)
  }

  // Hapus tugas
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Apakah Anda yakin ingin menghapus tugas ini?'
    )

    if (confirmDelete) {
      await db.tasks.delete(id)
    }
  }

  // Ubah status
  const handleComplete = async (task) => {
    await db.tasks.update(task.id, {
      completed: !task.completed
    })
  }

  return (

    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white transition-colors duration-300">

      {/* HEADER */}
      <header className="bg-indigo-600 text-white px-6 py-5 shadow">

        <div className="max-w-5xl mx-auto flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              TaskMate
            </h1>

            <p className="text-sm text-indigo-100">
              Student Task Management
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* TOMBOL DARK MODE DAN LIGHT MODE */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition"
              aria-label="Ganti tema"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >

              {darkMode ? (
                <Sun
                  size={22}
                  className="text-yellow-300"
                />
              ) : (
                <Moon
                  size={22}
                  className="text-white"
                />
              )}

            </button>

            <ClipboardList size={35} />

          </div>

        </div>

      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* WELCOME */}
        <section className="mb-7">

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Halo, Mahasiswa! 👋
          </h2>

          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola tugas kuliahmu dengan lebih teratur.
          </p>

        </section>

        {/* STATISTIK */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <StatCard
            title="Total Tugas"
            value={total}
            icon={<BookOpen />}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
          />

          <StatCard
            title="Belum Selesai"
            value={pending}
            icon={<Clock />}
            color="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
          />

          <StatCard
            title="Selesai"
            value={completed}
            icon={<CheckCircle2 />}
            color="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
          />

        </section>

        {/* DAFTAR TUGAS */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 transition-colors duration-300">

          <div className="flex justify-between items-center mb-5">

            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Daftar Tugas
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Semua tugas perkuliahan
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition"
            >
              <Plus size={18} />
              Tambah
            </button>

          </div>

          {/* LIST TUGAS */}
          <div className="space-y-3">

            {tasks.length === 0 ? (

              <div className="text-center py-12 text-slate-400 dark:text-slate-500">

                <ClipboardList
                  size={45}
                  className="mx-auto mb-3"
                />

                <p>Belum ada tugas.</p>

                <p className="text-sm">
                  Silakan tambahkan tugas pertama.
                </p>

              </div>

            ) : (

              tasks.map(task => (

                <div
                  key={task.id}
                  className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-4 flex items-start justify-between gap-3 transition-colors duration-300"
                >

                  <div className="flex items-start gap-3 min-w-0">

                    {/* STATUS TUGAS */}
                    <button
                      type="button"
                      onClick={() => handleComplete(task)}
                      className="mt-1 shrink-0"
                      aria-label="Ubah status tugas"
                    >

                      {task.completed ? (

                        <CheckCircle2 className="text-green-500" />

                      ) : (

                        <Circle className="text-slate-400 dark:text-slate-500" />

                      )}

                    </button>

                    <div className="min-w-0">

                      {/* JUDUL TUGAS */}
                      <h3 className={`font-semibold break-words ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>

                      {/* DESKRIPSI */}
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-wrap break-words">
                        {task.description}
                      </p>

                      {/* KATEGORI DAN DEADLINE */}
                      <div className="flex flex-wrap gap-2 mt-2">

                        <span className="text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-lg">
                          {task.category}
                        </span>

                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg">
                          Deadline: {task.dueDate || '-'}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* EDIT DAN HAPUS */}
                  <div className="flex gap-2 shrink-0">

                    <button
                      type="button"
                      onClick={() => handleEdit(task)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                      aria-label="Edit tugas"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                      aria-label="Hapus tugas"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

      </main>

      {/* MODAL FORM */}
      {showForm && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl transition-colors duration-300">

            {/* HEADER MODAL */}
            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-bold">
                {editingId !== null ? 'Edit Tugas' : 'Tambah Tugas'}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Tutup form"
              >
                <X />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* NAMA TUGAS */}
              <div>

                <label className="block text-sm font-medium mb-1">
                  Nama Tugas
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Contoh: Tugas Pemrograman Web"
                  className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />

              </div>

              {/* DESKRIPSI */}
              <div>

                <label className="block text-sm font-medium mb-1">
                  Deskripsi
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Deskripsi tugas..."
                  className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                />

              </div>

              {/* KATEGORI */}
              <div>

                <label className="block text-sm font-medium mb-1">
                  Kategori
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Kuliah</option>
                  <option>Praktikum</option>
                  <option>UTS</option>
                  <option>UAS</option>
                  <option>Proyek</option>
                </select>

              </div>

              {/* DEADLINE */}
              <div>

                <label className="block text-sm font-medium mb-1">
                  Deadline
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* TOMBOL FORM */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl py-2 transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 transition"
                >
                  Simpan
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* FOOTER */}
      <footer className="text-center text-sm text-slate-400 dark:text-slate-500 py-6">
        TaskMate PWA © 2026
      </footer>

    </div>
  )
}

// KOMPONEN STATISTIK
function StatCard({ title, value, icon, color }) {

  return (

    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm transition-colors duration-300">

      <div className="flex justify-between items-center">

        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3 className="text-3xl font-bold mt-2 text-slate-800 dark:text-white">
            {value}
          </h3>
        </div>

        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>

      </div>

    </div>

  )
}

export default App