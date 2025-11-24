import React, { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    CircularProgress,
    TextField,
    InputAdornment,
    Stack,
    MenuItem,
    Select,
    FormControl,
    OutlinedInput,
    Button,
    Snackbar,
    Alert
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import AdminLayout from '../../components/admin/AdminLayout'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const goals = ['lose', 'maintain', 'gain']
const statuses = ['active', 'suspended']

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [goalFilter, setGoalFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [statusUpdating, setStatusUpdating] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const { adminToken } = useAuth()

    useEffect(() => {
        const fetchUsers = async () => {
            if (!adminToken) return
            try {
                const res = await axios.get('/api/admin/users', {
                    headers: { Authorization: `Bearer ${adminToken}` }
                })
                setUsers(res.data.data)
            } catch (error) {
                console.error('Error fetching users:', error)
                setSnackbar({ open: true, message: 'Unable to load users', severity: 'error' })
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [adminToken])

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
            const matchesGoal = goalFilter === 'all' || user.goal === goalFilter
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter
            return matchesSearch && matchesGoal && matchesStatus
        })
    }, [users, search, goalFilter, statusFilter])

    const summary = useMemo(() => ({
        total: users.length,
        suspended: users.filter(user => user.status === 'suspended').length,
        active: users.filter(user => user.status === 'active').length
    }), [users])

    const exportCsv = () => {
        const rows = filteredUsers.map(user => ({
            Name: user.name,
            Email: user.email,
            Goal: user.goal,
            Status: user.status,
            Activity: user.activityLevel,
            Joined: new Date(user.createdAt).toLocaleDateString(),
            'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'
        }))
        if (!rows.length) {
            setSnackbar({ open: true, message: 'No data to export for current filters', severity: 'info' })
            return
        }
        const headers = Object.keys(rows[0])
        const csv = [
            headers.join(','),
            ...rows.map(row => headers.map(header => `"${row[header] ?? ''}"`).join(','))
        ].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'meal-planner-users.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleStatusChange = async (userId, nextStatus) => {
        setStatusUpdating(userId)
        try {
            const res = await axios.patch(`/api/admin/users/${userId}/status`, { status: nextStatus }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            })
            setUsers(prev => prev.map(user => user._id === userId ? { ...user, status: res.data.data.status } : user))
            setSnackbar({ open: true, message: 'Status updated', severity: 'success' })
        } catch (error) {
            console.error(error)
            setSnackbar({ open: true, message: error.response?.data?.error || 'Failed to update status', severity: 'error' })
        } finally {
            setStatusUpdating(null)
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    User Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Search, filter, and take actions on user accounts in real-time.
                </Typography>
            </Box>

            <GridSummary summary={summary} onExport={exportCsv} />

            <Paper sx={{ p: 2, mt: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                        fullWidth
                    />
                    <FormControl sx={{ minWidth: 160 }}>
                        <Select
                            value={goalFilter}
                            onChange={(e) => setGoalFilter(e.target.value)}
                            input={<OutlinedInput label="Goal" />}
                            displayEmpty
                        >
                            <MenuItem value="all">All goals</MenuItem>
                            {goals.map(goal => (
                                <MenuItem key={goal} value={goal}>{goal}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 160 }}>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            input={<OutlinedInput label="Status" />}
                            displayEmpty
                        >
                            <MenuItem value="all">All statuses</MenuItem>
                            {statuses.map(status => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table sx={{ minWidth: 900 }} aria-label="user table">
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Goal</TableCell>
                            <TableCell>Activity Level</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Joined</TableCell>
                            <TableCell>Last Login</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user._id} hover>
                                <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar>{user.name?.charAt(0) || '?'}</Avatar>
                                    <Box>
                                        <Typography fontWeight={600}>{user.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {user.preferences?.dietaryRestrictions?.[0] || 'No tags'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.goal}
                                        color={user.goal === 'lose' ? 'warning' : user.goal === 'gain' ? 'success' : 'info'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{user.activityLevel ? user.activityLevel.replace('_', ' ') : 'unknown'}</TableCell>
                                <TableCell>
                                    <Select
                                        size="small"
                                        value={user.status}
                                        onChange={(e) => handleStatusChange(user._id, e.target.value)}
                                        disabled={statusUpdating === user._id}
                                    >
                                        {statuses.map(status => (
                                            <MenuItem key={status} value={status}>{status}</MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </AdminLayout>
    )
}

function GridSummary({ summary, onExport }) {
    return (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Paper sx={{ flex: 1, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="subtitle2" color="text.secondary">Total users</Typography>
                    <Typography variant="h5">{summary.total}</Typography>
                </Box>
                <Chip label="All time" color="primary" />
            </Paper>
            <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Active</Typography>
                <Typography variant="h5" color="success.main">{summary.active}</Typography>
            </Paper>
            <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Suspended</Typography>
                <Typography variant="h5" color="warning.main">{summary.suspended}</Typography>
            </Paper>
            <Button
                variant="outlined"
                startIcon={<CloudDownloadIcon />}
                onClick={onExport}
                sx={{ alignSelf: 'stretch' }}
            >
                Export CSV
            </Button>
        </Stack>
    )
}
