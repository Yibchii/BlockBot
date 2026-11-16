import { useCallback, useEffect, useMemo, useState } from 'react';
import './InstructorDashboard.css';

// dummy data for demo purposes --> replace with API calls to fetch real data
const initialAssignments = [
    { id: 1, title: 'Temp 1', due: '2025-09-26', status: 'Active', submitted: 18, total: 20, icon: '♙' },
    { id: 2, title: 'Temp 2', due: '2025-10-03', status: 'Active', submitted: 16, total: 20, icon: '♜' },
    { id: 3, title: 'Temp 3', due: '2025-10-10', status: 'Active', submitted: 12, total: 20, icon: '♟' },
    { id: 4, title: 'Temp 4', due: '2025-10-24', status: 'Draft', submitted: 0, total: 20, icon: '♙' },
];

const formatDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// dummy data for demo purposes --> replace with API calls to fetch real data
const initialSubmissions = [
    { id: 1, student: 'Placeholder 1', assignment: 'Assignment 1', submitted: 'Sep 23, 10:42 AM', status: 'Submitted', grade: '' },
    { id: 2, student: 'Placeholder 2', assignment: 'Assignment 2', submitted: 'Sep 22, 04:17 PM', status: 'Submitted', grade: '' },
    { id: 3, student: 'Placeholder 3', assignment: 'Assignment 3', submitted: 'Sep 21, 02:33 PM', status: 'Needs Review', grade: '' },
];

export default function InstructorDashboard({user}) {
    const [classroom, setClassroom] = useState('');
    const [classrooms, setClassrooms] = useState([]);
    const [assignments, setAssignments] = useState(initialAssignments);
    const [submissions, setSubmissions] = useState(initialSubmissions);
    const [ modal, setModal] = useState(null);
    const [draft, setDraft] = useState({title: '', due: '', description: ''});
    const [grade, setGrade] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [menuId, setMenuId] = useState(null);
    const [notice, setNotice] = useState('');
    const [totalStudents, setTotalStudents] = useState(0);
    const progress = 72; // DEMO DATA
    const activeCount = assignments.filter((item) => item.status === 'Active').length;
    const gradedCount = submissions.filter((item) => item.grade !== '').length;
    const visibleSubmissions = useMemo(() => showAll ? submissions : submissions.slice(0, 3), [showAll, submissions]);

    function createAssignment(event) {
        event.preventDefault();
        if (!draft.title.trim() || !draft.due) return;
        setAssignments((items) => [...items, { id: Date.now(), title: draft.title.trim(), due: draft.due, status: 'Draft', submitted: 0, total: totalStudents, icon: '♙' }]);
        setDraft({ title: '', due: '', description: '' });
        setModal(null);
        setNotice('Draft assignment created locally. Connect an API to save it permanently.');
    }

    function saveGrade(event) {
        event.preventDefault();
        const numericGrade = Number(grade);
        if (grade.trim() === '' || !Number.isFinite(numericGrade) || numericGrade < 0 || numericGrade > 100) return;
        setSubmissions((items) => items.map((item) => item.id === modal.id ? { ...item, grade: String(numericGrade), status: 'Graded' } : item));
        setModal(null);
        setGrade('');
        setNotice('Grade updated locally. Connect the grading API to persist changes.');
    }

    function toggleStatus(id) {
        setAssignments((items) => items.map((item) => item.id === id ? { ...item, status: item.status === 'Draft' ? 'Active' : 'Draft' } : item));
        setMenuId(null);
        setNotice('Assignment status changed locally.');
    }

    function getOwnedClassrooms() {
        fetch('/api/classroom/owned/', { credentials: 'include' })
            .then((response) => {
                if (!response.ok) throw new Error('Unable to load classrooms');
                return response.json();
            })
            .then((data) => {
                const ownedClassrooms = Array.isArray(data)
                    ? data
                    : (data.results || data.classrooms || []);
                setClassrooms(ownedClassrooms);
                if (ownedClassrooms.length) {
                    const firstClassroom = ownedClassrooms[0];
                    setClassroom(String(firstClassroom.id));
                }
            })
            .catch(() => setNotice('Unable to load your classrooms.'));
    }

    const getClassroomMemberCount = useCallback((classroomId) => {
        return fetch(`/api/classroom/${classroomId}/info/`, { credentials: 'include' })
            .then((response) => {
                if (!response.ok) throw new Error('Unable to load classroom info');
                return response.json();
            })
            .then((data) => {
                return data.classroom.members.length;
            })
            .catch(() => {
                setNotice('Unable to load classroom info.');
                return 0;
            });
    }, []);

    useEffect(() => {
        getOwnedClassrooms();
    }, []);

    useEffect(() => {
        if (!classroom) return;

        let cancelled = false;
        getClassroomMemberCount(classroom).then((count) => {
            if (!cancelled) setTotalStudents(count);
        });

        return () => {
            cancelled = true;
        };
    }, [classroom, getClassroomMemberCount]);

    return (
        <main
            className="instructor-dashboard"
            aria-label={`${user?.display_name || user?.first_name || 'Instructor'} dashboard`}
        >
            <div className="id-body">
                <div className="id-controls">
                    <label htmlFor="id-class">Class:</label>
                    <select
                        id="id-class"
                        value={classroom}
                        onChange={(event) => {
                            setClassroom(event.target.value);
                            setTotalStudents(0);
                            setNotice('');
                        }}
                    >
                        {classrooms.length ? classrooms.map((ownedClassroom) => {
                            const label = ownedClassroom.name || ownedClassroom.title || ownedClassroom.code || String(ownedClassroom.id);
                            return <option key={ownedClassroom.id} value={String(ownedClassroom.id)}>{label}</option>;
                        }) : <option value="">No classrooms available</option>}
                    </select>
                    <button className="id-primary" onClick={() => setModal({ type: 'create' })}>
                        ＋ Create Assignment
                    </button>
                </div>
                {notice && (
                    <div className="id-notice" role="status">
                        {notice}
                        <button aria-label="Dismiss notice" onClick={() => setNotice('')}>
                            ×
                        </button>
                    </div>
                )}
                <div className="id-main-grid">
                    <section className="id-panel">
                        <h2>Assignment Management (Placeholder)</h2>
                        <div className="id-table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                        <th>Submissions</th>
                                        <th>
                                            <span className="id-sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map((assignment) => (
                                        <tr key={assignment.id}>
                                            <td>
                                                <span className="id-assignment-icon" aria-hidden="true">
                                                    {assignment.icon}
                                                </span>
                                                {assignment.title}
                                            </td>
                                            <td>{formatDate(assignment.due)}</td>
                                            <td>
                                                <span
                                                    className={`id-status ${assignment.status === 'Active' ? 'id-active' : 'id-draft'}`}
                                                >
                                                    ● {assignment.status}
                                                </span>
                                            </td>
                                            <td>{assignment.submitted} / {assignment.total}</td>
                                            <td className="id-action-cell">
                                                <button
                                                    className="id-menu-button"
                                                    aria-label={`Actions for ${assignment.title}`}
                                                    aria-expanded={menuId === assignment.id}
                                                    onClick={() => setMenuId(menuId === assignment.id ? null : assignment.id)}
                                                >
                                                    ⋮
                                                </button>
                                                {menuId === assignment.id && (
                                                    <div className="id-menu">
                                                        <button onClick={() => toggleStatus(assignment.id)}>
                                                            {assignment.status === 'Draft' ? 'Publish' : 'Move to draft'}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <section className="id-panel id-overview">
                        <h2>Class Overview</h2>
                        <div className="id-progress-line">
                            <div
                                className="id-progress-ring"
                                role="progressbar"
                                aria-label="Overall class progress"
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                                style={{ '--progress': `${progress}%` }}
                            >
                                <span>{progress}%</span>
                            </div>
                            <div>
                                <strong>Overall Progress</strong>
                                <p>14 / 20 students</p>
                            </div>
                            <span className="id-progress-label">
                                ↞ Progress
                                <br />
                                Overview
                            </span>
                        </div>
                        <div className="id-stats">
                            <div className="id-stat">
                                <span>♣ &nbsp; Total Students</span>
                                <strong>{totalStudents}</strong>
                            </div>
                            <div className="id-stat">
                                <span>▣ &nbsp; Assignments</span>
                                <strong>{assignments.length}</strong>
                            </div>
                            <div className="id-stat id-stat-split">
                                <span>◉ &nbsp; On Track</span>
                                <strong>14</strong>
                                <span>◉ &nbsp; Need Help</span>
                                <strong>6</strong>
                            </div>
                        </div>
                        <p className="id-small-note">
                            {activeCount} active assignments · {gradedCount} graded submissions
                        </p>
                    </section>
                </div>
                <section className="id-panel id-submissions">
                    <div className="id-section-title">
                        <h2>Recent Submissions (Placeholder)</h2>
                        <button className="id-text-button" onClick={() => setShowAll(!showAll)}>
                            {showAll ? 'Show Recent' : 'View All'}
                        </button>
                    </div>
                    <div className="id-table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Assignment</th>
                                    <th>Submitted</th>
                                    <th>Status</th>
                                    <th>Grade</th>
                                    <th>
                                        <span className="id-sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleSubmissions.map((submission) => (
                                    <tr key={submission.id}>
                                        <td>{submission.student}</td>
                                        <td>{submission.assignment}</td>
                                        <td>{submission.submitted}</td>
                                        <td>
                                            <span
                                                className={`id-status ${submission.status === 'Needs Review' ? 'id-review' : 'id-submitted'}`}
                                            >
                                                ● {submission.status}
                                            </span>
                                        </td>
                                        <td>{submission.grade ? `${submission.grade}%` : '—'}</td>
                                        <td>
                                            <button
                                                className="id-outline"
                                                onClick={() => {
                                                    setGrade(submission.grade);
                                                    setModal({
                                                        type: 'grade',
                                                        id: submission.id,
                                                        student: submission.student,
                                                        assignment: submission.assignment,
                                                    });
                                                }}
                                            >
                                                Grade
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            {modal && (
                <div
                    className="id-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setModal(null);
                    }}
                >
                    <section className="id-modal" role="dialog" aria-modal="true" aria-labelledby="id-modal-title">
                        <div className="id-modal-head">
                            <h2 id="id-modal-title">
                                {modal.type === 'create' ? 'Create Assignment' : `Grade ${modal.student}`}
                            </h2>
                            <button aria-label="Close dialog" onClick={() => setModal(null)}>
                                ×
                            </button>
                        </div>
                        {modal.type === 'create' ? (
                            <form onSubmit={createAssignment}>
                                <label>
                                    Assignment title
                                    <input
                                        required
                                        maxLength={120}
                                        value={draft.title}
                                        onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                                        placeholder="e.g. Maze Challenge"
                                    />
                                </label>
                                <label>
                                    Due date
                                    <input
                                        type="date"
                                        required
                                        value={draft.due}
                                        onChange={(event) => setDraft({ ...draft, due: event.target.value })}
                                    />
                                </label>
                                <label>
                                    Description
                                    <textarea
                                        rows="3"
                                        value={draft.description}
                                        onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                                        placeholder="Instructions for students"
                                    />
                                </label>
                                <div className="id-modal-actions">
                                    <button type="button" className="id-outline" onClick={() => setModal(null)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="id-primary">
                                        Create Draft
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={saveGrade}>
                                <p>{modal.assignment}</p>
                                <label>
                                    Grade (0–100)
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        required
                                        value={grade}
                                        onChange={(event) => setGrade(event.target.value)}
                                    />
                                </label>
                                <div className="id-modal-actions">
                                    <button type="button" className="id-outline" onClick={() => setModal(null)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="id-primary">
                                        Save Grade
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            )}
        </main>
    );

};
