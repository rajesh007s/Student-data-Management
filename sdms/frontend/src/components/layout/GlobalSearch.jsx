import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, GraduationCap, BookOpen, Building2 } from 'lucide-react';
import { searchService } from '../../services';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      searchService.search(query).then((res) => {
        setResults(res.data.data);
        setOpen(true);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const hasResults =
    results && (results.students.length || results.faculty.length || results.courses.length || results.departments.length);

  const go = (path) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search students, faculty, courses..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 focus:bg-white dark:focus:bg-ink-900 focus:border-brass-500 text-ink-800 dark:text-ink-100"
        />
      </div>

      {open && (
        <div className="absolute mt-2 w-full bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl2 shadow-card-hover max-h-96 overflow-y-auto z-50">
          {!hasResults && <p className="text-sm text-ink-400 px-4 py-6 text-center">No matches found</p>}

          {results?.students?.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Students</p>
              {results.students.map((s) => (
                <button
                  key={s._id}
                  onClick={() => go(`/students/${s._id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-ink-50 dark:hover:bg-ink-800 text-left"
                >
                  <User size={15} className="text-ink-400" />
                  <span className="text-sm text-ink-700 dark:text-ink-200">{s.name}</span>
                  <span className="text-xs font-mono text-ink-400 ml-auto">{s.studentId}</span>
                </button>
              ))}
            </div>
          )}

          {results?.faculty?.length > 0 && (
            <div className="py-2 border-t border-ink-50 dark:border-ink-800">
              <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Faculty</p>
              {results.faculty.map((f) => (
                <button
                  key={f._id}
                  onClick={() => go('/faculty')}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-ink-50 dark:hover:bg-ink-800 text-left"
                >
                  <GraduationCap size={15} className="text-ink-400" />
                  <span className="text-sm text-ink-700 dark:text-ink-200">{f.name}</span>
                </button>
              ))}
            </div>
          )}

          {results?.courses?.length > 0 && (
            <div className="py-2 border-t border-ink-50 dark:border-ink-800">
              <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Courses</p>
              {results.courses.map((c) => (
                <button
                  key={c._id}
                  onClick={() => go('/courses')}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-ink-50 dark:hover:bg-ink-800 text-left"
                >
                  <BookOpen size={15} className="text-ink-400" />
                  <span className="text-sm text-ink-700 dark:text-ink-200">{c.courseName}</span>
                </button>
              ))}
            </div>
          )}

          {results?.departments?.length > 0 && (
            <div className="py-2 border-t border-ink-50 dark:border-ink-800">
              <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Departments</p>
              {results.departments.map((d) => (
                <button
                  key={d._id}
                  onClick={() => go('/students')}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-ink-50 dark:hover:bg-ink-800 text-left"
                >
                  <Building2 size={15} className="text-ink-400" />
                  <span className="text-sm text-ink-700 dark:text-ink-200">{d.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
