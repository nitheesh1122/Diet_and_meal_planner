import React, { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Stack,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Alert,
    Divider,
    Tooltip as MuiTooltip
} from '@mui/material'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts'
import AdminLayout from '../../components/admin/AdminLayout'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const { adminToken } = useAuth()

    useEffect(() => {
        const fetchStats = async () => {
            if (!adminToken) return
            try {
                const res = await axios.get('/api/admin/stats', {
                    headers: { Authorization: `Bearer ${adminToken}` }
                })
                setStats(res.data.data)
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [adminToken])

    const summaryCards = useMemo(() => {
        if (!stats) return []
        const totals = stats.totals
        return [
            {
                title: 'Total Users',
                value: totals.totalUsers,
                helper: `${totals.newUsersThisWeek} new this week`,
                gradient: 'linear-gradient(135deg, #7F7FD5 0%, #86A8E7 50%, #91EAE4 100%)'
            },
            {
                title: 'Active (30d)',
                value: totals.activeUsersLast30,
                helper: `${Math.round((totals.activeUsersLast30 / Math.max(totals.totalUsers, 1)) * 100)}% of base`,
                gradient: 'linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)'
            },
            {
                title: 'Meal Plans (7d)',
                value: totals.mealPlansThisWeek,
                helper: `${stats.planCompletionRate}% completion`,
                gradient: 'linear-gradient(135deg, #F36265 0%, #961276 100%)'
            },
            {
                title: 'Alerts',
                value: stats.alerts?.length || 0,
                helper: stats.alerts?.length ? 'Needs attention' : 'All clear',
                gradient: 'linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)'
            }
        ]
    }, [stats])

    const userGrowth = stats?.userGrowth?.map(point => ({
        ...point,
        label: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })) || []

    if (loading) {
        return (
            <AdminLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        )
    }

    if (!stats) {
        return (
            <AdminLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6">Unable to load admin analytics.</Typography>
                    <Typography variant="body2" color="text.secondary">Check your permissions or try reloading.</Typography>
                </Box>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Super Admin Command Center
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Monitor platform health, user growth, and operational signals in real-time.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {summaryCards.map(card => (
                    <Grid key={card.title} item xs={12} sm={6} lg={3}>
                        <Card sx={{ height: '100%', background: card.gradient, color: 'white' }}>
                            <CardContent>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                                    {card.title}
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                                    {card.value?.toLocaleString() || 0}
                                </Typography>
                                <Typography variant="body2">
                                    {card.helper}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, height: 360 }}>
                        <Typography variant="h6" gutterBottom>
                            Acquisition Trend (last 30 days)
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#7F7FD5" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, height: 360, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Meal Completion Health
                            </Typography>
                            <Typography variant="h3" fontWeight="bold">
                                {stats?.planCompletionRate || 0}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={stats?.planCompletionRate || 0}
                                sx={{ height: 8, borderRadius: 4, mt: 2 }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Completed meal plans during the last 7 days.
                            </Typography>
                        </Box>
                        <Divider />
                        <Box>
                            <Typography variant="subtitle1" gutterBottom>
                                System Health
                            </Typography>
                            <List dense>
                                {stats?.systemHealth?.map(item => (
                                    <ListItem key={item.label} disableGutters>
                                        <ListItemAvatar>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: item.status === 'operational' ? 'success.main' : 'warning.main'
                                                }}
                                            >
                                                {item.status === 'operational' ? 'OK' : '!'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={item.label}
                                            secondary={item.detail}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 420 }}>
                        <Typography variant="h6" gutterBottom>
                            Users by Goal
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats?.usersByGoal}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" name="Users" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 420 }}>
                        <Typography variant="h6" gutterBottom>
                            Users by Gender
                        </Typography>
                        <ResponsiveContainer width="100%" height="70%">
                            <PieChart>
                                <Pie
                                    data={stats?.usersByGender}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name || 'N/A'} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {stats?.usersByGender?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                            Activity Mix
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                            {stats?.activityLevels?.map(level => (
                                <Chip
                                    key={level._id}
                                    label={`${level._id?.replace('_', ' ')} · ${level.count}`}
                                    size="small"
                                    color="primary"
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 420 }}>
                        <Typography variant="h6" gutterBottom>
                            Dietary Insights
                        </Typography>
                        <List dense>
                            {stats?.dietaryPreferences?.map(item => (
                                <ListItem key={item._id} disableGutters sx={{ py: 1 }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                            {item._id?.charAt(0)?.toUpperCase() || 'N'}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={item._id}
                                        secondary={`${item.count} users`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                            Operational Alerts
                        </Typography>
                        <Stack spacing={1}>
                            {stats?.alerts?.length
                                ? stats.alerts.map((alert, idx) => (
                                    <Alert key={idx} severity={alert.severity}>
                                        <Typography variant="subtitle2">{alert.title}</Typography>
                                        <Typography variant="body2">{alert.description}</Typography>
                                    </Alert>
                                ))
                                : <Alert severity="success">No outstanding issues.</Alert>
                            }
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 420, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Sign-ups
                        </Typography>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <List>
                                {stats?.recentUsers?.map(user => (
                                    <ListItem
                                        key={user._id}
                                        divider
                                        secondaryAction={
                                            <MuiTooltip title={user.activityLevel}>
                                                <Chip label={user.goal} color="primary" size="small" />
                                            </MuiTooltip>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar>
                                                {user.name?.charAt(0)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.name}
                                            secondary={`${user.email} · ${new Date(user.createdAt).toLocaleDateString()}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </AdminLayout>
    )
}
