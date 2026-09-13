import {
  useEffect,
  useState
} from 'react';

import {
  RefreshCw,
  Users,
  CreditCard,
  IndianRupee,
  Activity,
  Eye,
  Pencil,
  Save,
  X
} from 'lucide-react';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import PageShell from '../components/PageShell.jsx';
import {
  api,
  formatDate
} from '../lib/api.js';

function formatMonth(item) {
  if (!item?._id) {
    return '—';
  }

  return `${String(item._id.month).padStart(
    2,
    '0'
  )}/${item._id.year}`;
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString(
    'en-IN'
  )}`;
}

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] =
    useState(null);

  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [editingUser, setEditingUser] =
    useState(null);

  const [message, setMessage] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  async function loadDashboard() {
    try {
      setLoading(true);
      setMessage('');

      const [
        statsData,
        analyticsData,
        usersData
      ] = await Promise.all([
        api('/admin/stats'),
        api('/admin/analytics'),
        api('/admin/users')
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
      setUsers(usersData.users || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function viewUser(id) {
    try {
      const data =
        await api(`/admin/users/${id}`);

      setSelectedUser(data.user);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveUser(event) {
    event.preventDefault();

    try {
      setSaving(true);

      const data =
        await api(
          `/admin/users/${editingUser._id}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              name: editingUser.name,
              email: editingUser.email,
              phone: editingUser.phone,
              userType:
                editingUser.userType,
              profile:
                editingUser.profile || {}
            })
          }
        );

      setUsers((current) =>
        current.map((user) =>
          user._id === data.user._id
            ? data.user
            : user
        )
      );

      setSelectedUser(data.user);
      setEditingUser(null);

      setMessage(
        'User information updated successfully.'
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell
        title="Admin Dashboard"
        eyebrow="Administration"
        subtitle="Loading platform intelligence..."
      />
    );
  }

  return (
    <PageShell
      title="Admin Dashboard"
      eyebrow="Administration"
      subtitle="Monitor users, financial activity, platform performance and data operations from one secure workspace."
      actions={
        <button
          className="btn-secondary"
          onClick={loadDashboard}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      {message && (
        <div className="mb-6 rounded-2xl border border-black/10 bg-white p-4 text-sm font-semibold">
          {message}
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          [
            'Registered Users',
            stats?.totalUsers || 0,
            Users
          ],
          [
            'Loan Applications',
            stats?.totalLoanApplications || 0,
            CreditCard
          ],
          [
            'Scholarships',
            stats?.totalScholarships || 0,
            Activity
          ],
          [
            'Loan Products',
            stats?.totalLoanProducts || 0,
            IndianRupee
          ]
        ].map(
          ([label, value, Icon]) => (
            <div
              key={label}
              className="rounded-[1.5rem] border border-black/10 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-[#f4f1ea] p-3">
                  <Icon
                    size={20}
                    className="text-[#11110f]"
                  />
                </div>
              </div>

              <p className="mt-6 text-3xl font-medium tracking-[-0.04em]">
                {value}
              </p>

              <p className="mt-2 text-sm font-semibold">
                {label}
              </p>
            </div>
          )
        )}
      </div>

      {/* FINANCIAL OVERVIEW */}

      <section className="mt-8 rounded-[2rem] border border-black/10 bg-[#11110f] p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Financial overview
        </p>

        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-4xl font-medium tracking-[-0.05em]">
              {formatCurrency(
                analytics?.totalLoanAmount
              )}
            </h2>

            <p className="mt-2 text-sm text-white/45">
              Total loan amount requested through
              FinBridge applications
            </p>
          </div>
        </div>
      </section>

      {/* CHARTS */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* MONTHLY ACTIVE USERS */}

        <section className="rounded-[2rem] border border-black/10 bg-white p-6">
          <h2 className="text-xl font-semibold">
            Monthly Active Users
          </h2>

          <p className="mt-1 text-sm text-black/45">
            Users active during each month
          </p>

          <div className="mt-6 h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={
                  analytics?.monthlyActiveUsers || []
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey={(item) =>
                    formatMonth(item)
                  }
                />

                <YAxis />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#375b32"
                  fill="#dcebd8"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* MONTHLY LOANS */}

        <section className="rounded-[2rem] border border-black/10 bg-white p-6">
          <h2 className="text-xl font-semibold">
            Monthly Loan Applications
          </h2>

          <p className="mt-1 text-sm text-black/45">
            Loan requests submitted each month
          </p>

          <div className="mt-6 h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  analytics?.monthlyLoans || []
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey={(item) =>
                    formatMonth(item)
                  }
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="loans"
                  fill="#11110f"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* STATUS */}

        <section className="rounded-[2rem] border border-black/10 bg-white p-6">
          <h2 className="text-xl font-semibold">
            Loan Status Distribution
          </h2>

          <p className="mt-1 text-sm text-black/45">
            Approved, pending and defaulted
            applications
          </p>

          <div className="mt-6 h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    analytics?.loanStatus || []
                  }
                  dataKey="count"
                  nameKey="_id"
                  outerRadius={100}
                  label
                >
                  {(analytics?.loanStatus || []).map(
                    (entry, index) => (
                      <Cell
                        key={`status-${index}`}
                        fill={[
                          '#375b32',
                          '#c59f66',
                          '#9d4f4f'
                        ][index % 3]}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* POPULAR LOAN TYPES */}

        <section className="rounded-[2rem] border border-black/10 bg-white p-6">
          <h2 className="text-xl font-semibold">
            Popular Loan Types
          </h2>

          <p className="mt-1 text-sm text-black/45">
            Most requested loan categories
          </p>

          <div className="mt-6 h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  analytics?.popularLoanTypes || []
                }
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis type="number" />

                <YAxis
                  type="category"
                  dataKey="_id"
                  width={90}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#596d3f"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* USERS */}

      <section className="mt-8 rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
              User management
            </p>

            <h2 className="mt-2 text-3xl font-medium tracking-[-0.04em]">
              Registered users
            </h2>
          </div>

          <p className="text-sm text-black/45">
            {users.length} account(s)
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-black/10 text-xs uppercase tracking-[0.12em] text-black/40">
                <th className="px-4 py-3">
                  User
                </th>

                <th className="px-4 py-3">
                  Type
                </th>

                <th className="px-4 py-3">
                  Email
                </th>

                <th className="px-4 py-3">
                  Joined
                </th>

                <th className="px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-black/5"
                >
                  <td className="px-4 py-4">
                    <p className="font-semibold">
                      {user.name}
                    </p>

                    <p className="text-xs text-black/40">
                      {user.phone}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[#f4f1ea] px-3 py-1 text-xs font-semibold capitalize">
                      {user.userType}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {user.email}
                  </td>

                  <td className="px-4 py-4 text-sm text-black/50">
                    {formatDate(
                      user.createdAt
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        className="btn-secondary"
                        onClick={() =>
                          viewUser(user._id)
                        }
                      >
                        <Eye size={14} />
                        View
                      </button>

                      <button
                        className="btn-primary"
                        onClick={() =>
                          setEditingUser({
                            ...user,
                            profile: {
                              ...(user.profile || {})
                            }
                          })
                        }
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* USER DETAILS */}

      {selectedUser && (
        <section className="mt-6 rounded-[2rem] border border-black/10 bg-[#e8e2d7] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                User profile
              </p>

              <h2 className="mt-2 text-3xl font-medium">
                {selectedUser.name}
              </h2>
            </div>

            <button
              className="btn-secondary"
              onClick={() =>
                setSelectedUser(null)
              }
            >
              <X size={15} />
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['Email', selectedUser.email],
              ['Phone', selectedUser.phone],
              ['User type', selectedUser.userType],
              [
                'Last active',
                formatDate(
                  selectedUser.lastActiveAt
                )
              ],
              [
                'Education',
                selectedUser.profile?.educationLevel ||
                  'Not added'
              ],
              [
                'State',
                selectedUser.profile?.state ||
                  'Not added'
              ],
              [
                'City',
                selectedUser.profile?.city ||
                  'Not added'
              ],
              [
                'Income',
                selectedUser.profile?.annualFamilyIncome
                  ? formatCurrency(
                      selectedUser.profile
                        .annualFamilyIncome
                    )
                  : 'Not added'
              ]
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-black/10 bg-white p-4"
              >
                <p className="text-xs text-black/40">
                  {label}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EDIT USER */}

      {editingUser && (
        <section className="mt-6 rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                Edit account
              </p>

              <h2 className="mt-2 text-3xl font-medium">
                Update user information
              </h2>
            </div>

            <button
              className="btn-secondary"
              onClick={() =>
                setEditingUser(null)
              }
            >
              <X size={15} />
              Cancel
            </button>
          </div>

          <form
            onSubmit={saveUser}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <label className="text-sm font-semibold">
              Name
              <input
                className="field mt-1"
                value={editingUser.name || ''}
                onChange={(event) =>
                  setEditingUser({
                    ...editingUser,
                    name: event.target.value
                  })
                }
              />
            </label>

            <label className="text-sm font-semibold">
              Email
              <input
                className="field mt-1"
                type="email"
                value={editingUser.email || ''}
                onChange={(event) =>
                  setEditingUser({
                    ...editingUser,
                    email: event.target.value
                  })
                }
              />
            </label>

            <label className="text-sm font-semibold">
              Phone
              <input
                className="field mt-1"
                value={editingUser.phone || ''}
                onChange={(event) =>
                  setEditingUser({
                    ...editingUser,
                    phone: event.target.value
                  })
                }
              />
            </label>

            <label className="text-sm font-semibold">
              Role
              <select
                className="field mt-1"
                value={editingUser.userType || 'student'}
                onChange={(event) =>
                  setEditingUser({
                    ...editingUser,
                    userType:
                      event.target.value
                  })
                }
              >
                <option value="student">
                  Student
                </option>

                <option value="parent">
                  Parent
                </option>

                <option value="professional">
                  Professional
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>
            </label>

            <label className="text-sm font-semibold">
              Education
              <input
                className="field mt-1"
                value={
                  editingUser.profile
                    ?.educationLevel || ''
                }
                onChange={(event) =>
                  setEditingUser({
                    ...editingUser,
                    profile: {
                      ...(editingUser.profile || {}),
                      educationLevel:
                        event.target.value
                    }
                  })
                }
              />
            </label>

            <label className="text-sm font-semibold">
              State
              <input
                className="field mt-1"
                value={
                  editingUser.profile?.state || ''
                }
                onChange={(event) =>
                  setEditingUser({
                    ...editingUser,
                    profile: {
                      ...(editingUser.profile || {}),
                      state:
                        event.target.value
                    }
                  })
                }
              />
            </label>

            <label className="text-sm font-semibold">
              City
              <input
                className="field mt-1"
                value={
                  editingUser.profile?.city || ''
                }
                onChange={(event) =>
                  setEditingUser({
                    ...editingUser,
                    profile: {
                      ...(editingUser.profile || {}),
                      city:
                        event.target.value
                    }
                  })
                }
              />
            </label>

            <label className="text-sm font-semibold">
              Annual family income
              <input
                className="field mt-1"
                type="number"
                value={
                  editingUser.profile
                    ?.annualFamilyIncome || ''
                }
                onChange={(event) =>
                  setEditingUser({
                    ...editingUser,
                    profile: {
                      ...(editingUser.profile || {}),
                      annualFamilyIncome:
                        Number(
                          event.target.value
                        )
                    }
                  })
                }
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary md:col-span-2"
            >
              <Save size={16} />

              {saving
                ? 'Saving...'
                : 'Save changes'}
            </button>
          </form>
        </section>
      )}

      {/* DATA SYNC */}

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-black/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/35">
            Scholarship data
          </p>

          <h3 className="mt-3 text-xl font-semibold">
            Data freshness
          </h3>

          <p className="mt-2 text-sm text-black/50">
            Oldest verified record:{' '}
            {formatDate(
              stats?.dataFreshness
                ?.oldestScholarship
            )}
          </p>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/35">
            Loan data
          </p>

          <h3 className="mt-3 text-xl font-semibold">
            Data freshness
          </h3>

          <p className="mt-2 text-sm text-black/50">
            Oldest verified record:{' '}
            {formatDate(
              stats?.dataFreshness?.oldestLoan
            )}
          </p>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/35">
            Source monitoring
          </p>

          <h3 className="mt-3 text-xl font-semibold">
            Failed syncs
          </h3>

          <p className="mt-2 text-3xl font-medium">
            {stats?.failedSyncs?.length || 0}
          </p>
        </div>
      </section>
    </PageShell>
  );
}