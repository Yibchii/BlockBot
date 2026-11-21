import { useEffect, useState } from "react";
import {
  Activity,
  Award,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";
import "./Classroom.css";

const initialAssignments = [
  {
    id: 1,
    title: "Maze Challenge 1",
    due: "Sep 30, 2025",
    status: "In Progress",
    progress: 75,
  },
  {
    id: 2,
    title: "Robot Dance",
    due: "Sep 25, 2025",
    status: "Completed",
    progress: 100,
  },
  {
    id: 3,
    title: "Sensor Challenge",
    due: "Sep 22, 2025",
    status: "Completed",
    progress: 100,
  },
];

const activities = [
  {
    icon: Check,
    color: "green",
    title: 'You submitted "Maze Challenge 1"',
    detail: "Today, 10:24 AM",
  },
  {
    icon: Megaphone,
    color: "purple",
    title: "Mrs. Johnson posted an announcement",
    detail: '"Great work on your mazes! Next up is the..."',
  },
  {
    icon: Award,
    color: "yellow",
    title: "You earned a badge",
    detail: '"Maze Explorer"',
  },
  {
    icon: CalendarDays,
    color: "blue",
    title: "New assignment available",
    detail: "Robot Dance",
  },
];

function hasInstructorRole(user) {
  return (
    user?.role?.toLowerCase() === "instructor" ||
    user?.is_instructor === true ||
    user?.groups?.some((group) =>
      (typeof group === "string" ? group : group?.name)?.toLowerCase() ===
      "instructor"
    )
  );
}

export default function Classroom() {
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classroomInfo, setClassroomInfo] = useState(null);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const instructor = hasInstructorRole(user);

  useEffect(() => {
    const controller = new AbortController();

    async function loadClassrooms() {
      try {
        const userResponse = await fetch("/api/user/info/", {
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (!userResponse.ok) {
          throw new Error("Please log in to view your classroom.");
        }

        const userData = await userResponse.json();
        setUser(userData);

        const endpoint = hasInstructorRole(userData)
          ? "/api/classroom/owned/"
          : "/api/classroom/member/";

        const classroomResponse = await fetch(endpoint, {
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (!classroomResponse.ok) {
          throw new Error("Unable to load your classrooms.");
        }

        const data = await classroomResponse.json();
        const results = data.classrooms || data.results || [];

        setClassrooms(results);
        setSelectedClassroom(results[0] || null);
      } catch (err) {
        if (err.name !== "AbortError") setNotice(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadClassrooms();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedClassroom?.id) {
      setClassroomInfo(null);
      return undefined;
    }

    const controller = new AbortController();

    fetch(`/api/classroom/${selectedClassroom.id}/info/`, {
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load classroom details.");
        return response.json();
      })
      .then((data) => setClassroomInfo(data.classroom))
      .catch((err) => {
        if (err.name !== "AbortError") setNotice(err.message);
      });

    return () => controller.abort();
  }, [selectedClassroom]);

  if (loading) {
    return (
      <main className="classroom-page">
        <p className="classroom-message">Loading classroom…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="classroom-page">
        <p className="classroom-message">
          {notice || "Please log in to view your classroom."}
        </p>
      </main>
    );
  }

  const members = classroomInfo?.members || [];
  const className = selectedClassroom?.name || "Classroom";

  const tabs = instructor
    ? ["Overview", "Assignments", "Students", "Gradebook", "Announcements"]
    : ["Overview", "Assignments", "Announcements"];

  const sidebarItems = [
    { label: "Overview", studentLabel: "My Classes", icon: Users },
    { label: "Assignments", icon: ClipboardList },
    ...(instructor
      ? [
          { label: "Students", icon: Users },
          { label: "Gradebook", icon: Award },
        ]
      : []),
    { label: "Schedule", icon: CalendarDays },
    { label: "Messages", icon: Megaphone },
    ...(instructor
      ? [
          { label: "Announcements", icon: Activity },
          { label: "Settings", icon: Settings },
        ]
      : []),
  ];

  function openAssignment(assignment) {
    setSelectedAssignment(assignment);
  }

  function addAssignment(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "").trim();
    const due = String(formData.get("due") || "");

    if (!title || !due) return;

    setAssignments((current) => [
      ...current,
      {
        id: Date.now(),
        title,
        due: new Date(`${due}T12:00:00`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: "Upcoming",
        progress: 0,
      },
    ]);
    setActiveTab("Assignments");
    setNotice("Assignment added for this session. It is not saved to the server.");
    event.currentTarget.reset();
  }

  return (
    <main
      className={`classroom-page ${
        instructor ? "classroom-page--teacher" : "classroom-page--student"
      }`}
    >
      <aside className="classroom-sidebar">
        <h1 className="classroom-sidebar-title">
          <GraduationCap size={23} />
          Classroom
        </h1>

        {sidebarItems.map(({ label, studentLabel, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className={`classroom-side-link ${
              activeTab === label ? "is-active" : ""
            }`}
            onClick={() => setActiveTab(label)}
          >
            <Icon size={17} />
            {studentLabel && !instructor ? studentLabel : label}
          </button>
        ))}
      </aside>

      <section className="classroom-main">
        {notice && (
          <p className="classroom-notice" role="status">
            {notice}
            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss">
              ×
            </button>
          </p>
        )}

        <header className="classroom-heading">
          <div className="classroom-title-group">
            <div className="classroom-icon">
              <Users size={27} />
            </div>
            <div>
              <h2>{className}</h2>
              <p>
                {instructor
                  ? `${members.length} Students · ${
                      user.first_name || user.display_name || "Instructor"
                    }`
                  : `${classroomInfo?.owner || "Your instructor"} · ${
                      members.length
                    } Students`}
              </p>
            </div>
          </div>

          {classrooms.length > 1 && (
            <label className="classroom-select-label">
              Class
              <select
                value={selectedClassroom?.id || ""}
                onChange={(event) => {
                  const nextClass = classrooms.find(
                    (item) => String(item.id) === event.target.value
                  );
                  setSelectedClassroom(nextClass || null);
                }}
              >
                {classrooms.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {instructor ? (
            <div className="classroom-heading-actions">
              <button
                type="button"
                className="classroom-primary"
                onClick={() => setActiveTab("Assignments")}
              >
                ＋ Create Assignment
              </button>
              <button
                type="button"
                className="classroom-secondary"
                onClick={() => setActiveTab("Settings")}
              >
                Class Settings
              </button>
            </div>
          ) : (
            <div className="classroom-next-class">
              <CalendarDays size={20} />
              <div>
                <strong>Next Class</strong>
                <span>Check with your instructor for the schedule.</span>
              </div>
            </div>
          )}
        </header>

        <nav className="classroom-tabs" aria-label="Classroom sections">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? "is-active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {!selectedClassroom ? (
          <section className="classroom-empty">
            <Users size={32} />
            <h3>No classroom yet</h3>
            <p>
              {instructor
                ? "Create a classroom to get started."
                : "Ask your instructor for a classroom invite."}
            </p>
          </section>
        ) : activeTab === "Overview" ? (
          instructor ? (
            <TeacherOverview
              members={members}
              assignments={assignments}
              onOpenAssignments={() => setActiveTab("Assignments")}
              onOpenStudents={() => setActiveTab("Students")}
            />
          ) : (
            <StudentOverview
              assignments={assignments}
              onOpenAssignment={openAssignment}
              onOpenAssignments={() => setActiveTab("Assignments")}
            />
          )
        ) : activeTab === "Assignments" ? (
          <section className="classroom-card classroom-list-card">
            <div className="classroom-card-heading">
              <h3>Assignments</h3>
              {instructor && (
                <button
                  type="button"
                  className="classroom-text-button"
                  onClick={() => setNotice("Use the form below to add an assignment.")}
                >
                  Add assignment
                </button>
              )}
            </div>

            {instructor && (
              <form className="classroom-add-form" onSubmit={addAssignment}>
                <label>
                  Assignment title
                  <input name="title" required placeholder="e.g. Maze Challenge" />
                </label>
                <label>
                  Due date
                  <input name="due" type="date" required />
                </label>
                <button type="submit" className="classroom-primary">
                  Add
                </button>
              </form>
            )}

            <AssignmentRows
              assignments={assignments}
              onOpenAssignment={openAssignment}
            />
          </section>
        ) : activeTab === "Students" || activeTab === "Gradebook" ? (
          <Students members={members} showGrades={activeTab === "Gradebook"} />
        ) : (
          <section className="classroom-card classroom-list-card">
            <h3>{activeTab}</h3>
            <p className="classroom-muted">
              {activeTab === "Settings"
                ? "Class settings will be available here."
                : "Class updates and announcements will appear here."}
            </p>
            <div className="classroom-activity">
              <span className="activity-icon activity-icon--purple">
                <Megaphone size={19} />
              </span>
              <div>
                <strong>Welcome to {activeTab.toLowerCase()}</strong>
                <span>Check the Assignments tab for classroom work and due dates.</span>
              </div>
            </div>
          </section>
        )}

        {selectedAssignment && (
          <div
            className="classroom-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedAssignment(null);
            }}
          >
            <section
              className="classroom-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="assignment-dialog-title"
            >
              <button
                type="button"
                className="classroom-modal-close"
                onClick={() => setSelectedAssignment(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 id="assignment-dialog-title">{selectedAssignment.title}</h2>
              <p>Due {selectedAssignment.due}</p>
              <p>
                Status: <strong>{selectedAssignment.status}</strong>
              </p>
              {!instructor && <p>Your progress: {selectedAssignment.progress}%</p>}
              <button
                type="button"
                className="classroom-primary"
                onClick={() => setSelectedAssignment(null)}
              >
                Close
              </button>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function StudentOverview({ assignments, onOpenAssignment, onOpenAssignments }) {
  const currentAssignment = assignments[0];

  return (
    <div className="classroom-content classroom-student-grid">
      <div className="classroom-main-column">
        <section className="classroom-card">
          <h3>Current Assignment</h3>
          {currentAssignment ? (
            <button
              type="button"
              className="classroom-current-assignment"
              onClick={() => onOpenAssignment(currentAssignment)}
            >
              <span className="assignment-art">
                <ClipboardList size={30} />
              </span>
              <span className="assignment-description">
                <strong>{currentAssignment.title}</strong>
                <span>
                  Use the block programming language to navigate the maze and
                  reach the finish line.
                </span>
                <small>
                  <CalendarDays size={15} /> Due: {currentAssignment.due}
                </small>
              </span>
              <span className="classroom-progress">
                {currentAssignment.progress}%
              </span>
              <span className="classroom-primary">
                Open Assignment <ChevronRight size={16} />
              </span>
            </button>
          ) : (
            <p className="classroom-muted">No assignments yet.</p>
          )}
        </section>

        <section className="classroom-card">
          <div className="classroom-card-heading">
            <h3>Recent Assignments</h3>
            <button
              type="button"
              className="classroom-text-button"
              onClick={onOpenAssignments}
            >
              View All
            </button>
          </div>
          <AssignmentRows
            assignments={assignments.slice(0, 3)}
            onOpenAssignment={onOpenAssignment}
          />
        </section>
      </div>

      <aside className="classroom-card classroom-activity-card">
        <h3><Users size={19} /> Class Activities</h3>
        {activities.map(({ icon: Icon, color, title, detail }) => (
          <div className="classroom-activity" key={title}>
            <span className={`activity-icon activity-icon--${color}`}>
              <Icon size={19} />
            </span>
            <div>
              <strong>{title}</strong>
              <span>{detail}</span>
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}

function TeacherOverview({
  members,
  assignments,
  onOpenAssignments,
  onOpenStudents,
}) {
  return (
    <div className="classroom-content classroom-teacher-grid">
      <div className="classroom-teacher-main">
        <div className="classroom-stats">
          <div><Users /><strong>{members.length}</strong><span>Total Students</span></div>
          <div><ClipboardList /><strong>{assignments.length}</strong><span>Assignments</span></div>
          <div><Check /><strong>3</strong><span>Submitted This Week</span></div>
          <div><Award /><strong>87%</strong><span>Class Average</span></div>
        </div>

        <section className="classroom-card">
          <div className="classroom-card-heading">
            <h3>Recent Submissions</h3>
            <button
              type="button"
              className="classroom-text-button"
              onClick={onOpenStudents}
            >
              View All
            </button>
          </div>
          <div className="classroom-table-wrap">
            <table className="classroom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {members.slice(0, 4).map((member, index) => (
                  <tr key={`${member}-${index}`}>
                    <td>{member}</td>
                    <td>{assignments[index % assignments.length]?.title || "—"}</td>
                    <td>Sep {29 - index}, 10:24 AM</td>
                    <td><span className="status-dot">● Submitted</span></td>
                    <td>—</td>
                  </tr>
                ))}
                {!members.length && (
                  <tr><td colSpan="5">No students have joined this class yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside className="classroom-teacher-aside">
        <section className="classroom-card">
          <div className="classroom-card-heading">
            <h3>Class Progress</h3>
            <button
              type="button"
              className="classroom-text-button"
              onClick={onOpenStudents}
            >
              View Details
            </button>
          </div>
          <div className="teacher-progress">
            <span className="classroom-progress">68%</span>
            <div>
              <strong>Overall Completion</strong>
              <span>{Math.min(5, members.length)} of {members.length} students</span>
            </div>
          </div>
          <div className="teacher-mini-stats">
            <span>✓ Completed&nbsp; 3</span>
            <span>◉ In Progress&nbsp; 4</span>
            <span>⚠ Needs Help&nbsp; 1</span>
          </div>
        </section>

        <section className="classroom-card">
          <div className="classroom-card-heading">
            <h3>Upcoming Assignments</h3>
            <button
              type="button"
              className="classroom-text-button"
              onClick={onOpenAssignments}
            >
              View All
            </button>
          </div>
          {assignments.slice(0, 3).map((assignment) => (
            <div className="upcoming-assignment" key={assignment.id}>
              <ClipboardList size={16} />
              <span>{assignment.title}<small>Due {assignment.due}</small></span>
              <b>Upcoming</b>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}

function AssignmentRows({ assignments, onOpenAssignment }) {
  return (
    <div className="classroom-assignment-list">
      {assignments.map((assignment) => (
        <button
          type="button"
          className="classroom-assignment-row"
          key={assignment.id}
          onClick={() => onOpenAssignment(assignment)}
        >
          <span className="assignment-art assignment-art--small">
            <ClipboardList size={20} />
          </span>
          <span className="assignment-row-title">
            <strong>{assignment.title}</strong>
            <small>Due {assignment.due}</small>
          </span>
          <span
            className={`assignment-status ${
              assignment.status === "Completed" ? "is-complete" : ""
            }`}
          >
            ● {assignment.status}
          </span>
          <span className="assignment-row-progress">› {assignment.progress}%</span>
          <ChevronRight size={17} />
        </button>
      ))}
    </div>
  );
}

function Students({ members, showGrades }) {
  return (
    <section className="classroom-card classroom-list-card">
      <h3>{showGrades ? "Gradebook" : "Students"}</h3>
      <div className="classroom-table-wrap">
        <table className="classroom-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>{showGrades ? "Average" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={`${member}-${index}`}>
                <td>{member}</td>
                <td>Member</td>
                <td>{showGrades ? `${87 - index}%` : "Active"}</td>
              </tr>
            ))}
            {!members.length && (
              <tr><td colSpan="3">No students have joined this class yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}