import {
  BusinessAnalytics,
  BusinessOverview,
  RevenueAnalytics,
  ProductivityAnalytics,
  ClientAnalytics,
  ProjectPerformanceAnalytics,
  TimeAnalytics,
  TrendAnalytics,
  MonthlyRevenue,
  ProjectRevenue,
  ClientRevenue,
  TeamEfficiency,
  ProductivityBottleneck,
  ClientSatisfaction,
  ProjectProfitability,
  ResourceUtilization,
  StatusDistribution,
  DailyHours,
  WeeklyTrend,
  MonthlyTimeBreakdown,
  ProjectTimeAllocation,
  OvertimeAnalysis,
  GrowthTrend,
  ProductivityTrend,
  SeasonalPattern,
  AnalyticsFilter,
  Project,
  Client,
  Task,
  TimeEntry,
  ProjectStatus,
  TaskStatus,
} from '../types';
import { clientService } from './clientService';
import { projectService } from './projectService';
import { taskService } from './taskService';
import { timeTrackingService } from './timeTrackingService';

class AnalyticsService {
  /**
   * Get comprehensive business analytics
   */
  async getBusinessAnalytics(
    filter?: AnalyticsFilter
  ): Promise<BusinessAnalytics> {
    const [
      overview,
      revenue,
      productivity,
      clients,
      projects,
      timeTracking,
      trends,
    ] = await Promise.all([
      this.getBusinessOverview(filter),
      this.getRevenueAnalytics(filter),
      this.getProductivityAnalytics(filter),
      this.getClientAnalytics(filter),
      this.getProjectPerformanceAnalytics(filter),
      this.getTimeAnalytics(filter),
      this.getTrendAnalytics(filter),
    ]);

    return {
      overview,
      revenue,
      productivity,
      clients,
      projects,
      timeTracking,
      trends,
    };
  }

  /**
   * Get business overview metrics
   */
  async getBusinessOverview(
    filter?: AnalyticsFilter
  ): Promise<BusinessOverview> {
    const [allProjects, allClients, allTimeEntries] = await Promise.all([
      projectService.getAllProjects(),
      clientService.getAllClients(),
      timeTrackingService.getAllTimeEntries(),
    ]);

    const projects = this.filterProjects(allProjects, filter);
    const clients = this.filterClients(allClients, filter);
    const timeEntries = this.filterTimeEntries(allTimeEntries, filter);

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(
      p => p.status === 'completed'
    ).length;
    const activeClients = clients.filter(c => c.status === 'active').length;

    const totalHours =
      timeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60; // Convert to hours
    const billableHours =
      timeEntries
        .filter(entry => entry.billable)
        .reduce((sum, entry) => sum + entry.duration, 0) / 60;

    const totalRevenue = timeEntries
      .filter(entry => entry.billable && entry.hourlyRate)
      .reduce(
        (sum, entry) => sum + (entry.duration / 60) * (entry.hourlyRate || 0),
        0
      );

    // Calculate monthly revenue (current month)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTimeEntries = timeEntries.filter(
      entry => entry.createdAt.slice(0, 7) === currentMonth
    );
    const monthlyRevenue = monthlyTimeEntries
      .filter(entry => entry.billable && entry.hourlyRate)
      .reduce(
        (sum, entry) => sum + (entry.duration / 60) * (entry.hourlyRate || 0),
        0
      );

    // Calculate revenue growth (compare to previous month)
    const previousMonth = new Date(
      new Date().setMonth(new Date().getMonth() - 1)
    )
      .toISOString()
      .slice(0, 7);
    const previousMonthEntries = timeEntries.filter(
      entry => entry.createdAt.slice(0, 7) === previousMonth
    );
    const previousMonthRevenue = previousMonthEntries
      .filter(entry => entry.billable && entry.hourlyRate)
      .reduce(
        (sum, entry) => sum + (entry.duration / 60) * (entry.hourlyRate || 0),
        0
      );

    const revenueGrowth =
      previousMonthRevenue > 0
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

    const utilization = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

    return {
      totalRevenue,
      monthlyRevenue,
      revenueGrowth,
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      totalClients: clients.length,
      activeClients,
      totalHours,
      billableHours,
      utilization,
    };
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(
    filter?: AnalyticsFilter
  ): Promise<RevenueAnalytics> {
    const [allProjects, allClients, allTimeEntries] = await Promise.all([
      projectService.getAllProjects(),
      clientService.getAllClients(),
      timeTrackingService.getAllTimeEntries(),
    ]);

    const projects = this.filterProjects(allProjects, filter);
    const clients = this.filterClients(allClients, filter);
    const timeEntries = this.filterTimeEntries(allTimeEntries, filter);

    // Monthly revenue breakdown
    const monthly = this.calculateMonthlyRevenue(timeEntries, projects);

    // Revenue by project
    const byProject = this.calculateProjectRevenue(projects, timeEntries);

    // Revenue by client
    const byClient = this.calculateClientRevenue(
      clients,
      projects,
      timeEntries
    );

    // Billable vs non-billable
    const billableRevenue = timeEntries
      .filter(entry => entry.billable && entry.hourlyRate)
      .reduce(
        (sum, entry) => sum + (entry.duration / 60) * (entry.hourlyRate || 0),
        0
      );

    const nonBillableHours =
      timeEntries
        .filter(entry => !entry.billable)
        .reduce((sum, entry) => sum + entry.duration, 0) / 60;

    // Average project value
    const averageProjectValue =
      byProject.length > 0
        ? byProject.reduce((sum, p) => sum + p.revenue, 0) / byProject.length
        : 0;

    // Top performing projects
    const topPerformingProjects = byProject
      .sort((a, b) => b.profitability - a.profitability)
      .slice(0, 5);

    return {
      monthly,
      byProject,
      byClient,
      billableVsNonBillable: {
        billable: billableRevenue,
        nonBillable: nonBillableHours * 50, // Estimated cost
      },
      averageProjectValue,
      topPerformingProjects,
    };
  }

  /**
   * Get productivity analytics
   */
  async getProductivityAnalytics(
    filter?: AnalyticsFilter
  ): Promise<ProductivityAnalytics> {
    const [allTasks, allProjects] = await Promise.all([
      taskService.getAllTasks(),
      projectService.getAllProjects(),
    ]);

    const tasks = this.filterTasks(allTasks, filter);
    const projects = this.filterProjects(allProjects, filter);

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const overdueTasks = tasks.filter(
      t =>
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        t.status !== 'completed'
    );

    // Average task completion time
    const averageTaskCompletionTime =
      completedTasks.length > 0
        ? completedTasks.reduce((sum, task) => {
            if (task.completedAt && task.createdAt) {
              const completion = new Date(task.completedAt).getTime();
              const creation = new Date(task.createdAt).getTime();
              return sum + (completion - creation) / (1000 * 60 * 60 * 24); // Days
            }
            return sum;
          }, 0) / completedTasks.length
        : 0;

    // Overdue percentage
    const overdueTasksPercentage =
      tasks.length > 0 ? (overdueTasks.length / tasks.length) * 100 : 0;

    // Project delivery rate
    const completedOnTimeProjects = projects.filter(
      p =>
        p.status === 'completed' &&
        p.deadline &&
        p.endDate &&
        new Date(p.endDate) <= new Date(p.deadline)
    );
    const projectDeliveryRate =
      projects.filter(p => p.status === 'completed').length > 0
        ? (completedOnTimeProjects.length /
            projects.filter(p => p.status === 'completed').length) *
          100
        : 0;

    // Team efficiency (mock data for now)
    const teamEfficiency: TeamEfficiency[] = [
      {
        userId: 'user1',
        userName: 'John Doe',
        tasksCompleted: completedTasks.filter(t =>
          t.assignedTo.includes('user1')
        ).length,
        hoursWorked: 160,
        efficiency: 85,
        utilization: 90,
      },
    ];

    // Bottlenecks
    const bottlenecks: ProductivityBottleneck[] = [];
    if (overdueTasksPercentage > 20) {
      bottlenecks.push({
        type: 'task',
        description: 'High percentage of overdue tasks',
        impact: 'high',
        affectedProjects: projects.map(p => p.id),
      });
    }

    return {
      tasksCompleted: completedTasks.length,
      averageTaskCompletionTime,
      overdueTasksPercentage,
      projectDeliveryRate,
      teamEfficiency,
      bottlenecks,
    };
  }

  /**
   * Get client analytics
   */
  async getClientAnalytics(filter?: AnalyticsFilter): Promise<ClientAnalytics> {
    const [allClients, allProjects, allTimeEntries] = await Promise.all([
      clientService.getAllClients(),
      projectService.getAllProjects(),
      timeTrackingService.getAllTimeEntries(),
    ]);

    const clients = this.filterClients(allClients, filter);
    const projects = this.filterProjects(allProjects, filter);
    const timeEntries = this.filterTimeEntries(allTimeEntries, filter);

    // New clients this month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const newClientsThisMonth = clients.filter(
      c => c.createdAt.slice(0, 7) === currentMonth
    ).length;

    // Client retention rate (mock calculation)
    const clientRetentionRate = 85; // Would need historical data

    // Average projects per client
    const averageProjectsPerClient =
      clients.length > 0 ? projects.length / clients.length : 0;

    // Top clients by revenue
    const topClientsByRevenue = this.calculateClientRevenue(
      clients,
      projects,
      timeEntries
    )
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Client satisfaction (mock data)
    const clientSatisfactionScores: ClientSatisfaction[] = clients
      .slice(0, 5)
      .map(client => ({
        clientId: client.id,
        clientName: client.name,
        score: Math.floor(Math.random() * 3) + 8, // 8-10 range
        lastSurveyDate: new Date().toISOString(),
      }));

    return {
      totalClients: clients.length,
      newClientsThisMonth,
      clientRetentionRate,
      averageProjectsPerClient,
      topClientsByRevenue,
      clientSatisfactionScores,
    };
  }

  /**
   * Get project performance analytics
   */
  async getProjectPerformanceAnalytics(
    filter?: AnalyticsFilter
  ): Promise<ProjectPerformanceAnalytics> {
    const [allProjects, allTimeEntries] = await Promise.all([
      projectService.getAllProjects(),
      timeTrackingService.getAllTimeEntries(),
    ]);

    const projects = this.filterProjects(allProjects, filter);
    const timeEntries = this.filterTimeEntries(allTimeEntries, filter);

    // On-time delivery
    const completedProjects = projects.filter(p => p.status === 'completed');
    const onTimeProjects = completedProjects.filter(
      p =>
        p.deadline && p.endDate && new Date(p.endDate) <= new Date(p.deadline)
    );
    const onTimeDelivery =
      completedProjects.length > 0
        ? (onTimeProjects.length / completedProjects.length) * 100
        : 0;

    // Budget adherence
    const projectsWithBudget = projects.filter(
      p => p.budget && p.totalSpent !== undefined
    );
    const onBudgetProjects = projectsWithBudget.filter(
      p => p.totalSpent! <= p.budget!
    );
    const budgetAdherence =
      projectsWithBudget.length > 0
        ? (onBudgetProjects.length / projectsWithBudget.length) * 100
        : 0;

    // Profitability analysis
    const profitabilityAnalysis = this.calculateProjectProfitability(
      projects,
      timeEntries
    );

    // Resource utilization (mock data)
    const resourceUtilization: ResourceUtilization[] = [
      {
        resourceType: 'human',
        name: 'Development Team',
        utilization: 85,
        capacity: 100,
      },
      {
        resourceType: 'human',
        name: 'Design Team',
        utilization: 70,
        capacity: 100,
      },
    ];

    // Project status distribution
    const statusCounts = projects.reduce(
      (acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      },
      {} as Record<ProjectStatus, number>
    );

    const projectStatusDistribution: StatusDistribution[] = Object.entries(
      statusCounts
    ).map(([status, count]) => ({
      status: status as ProjectStatus,
      count,
      percentage: (count / projects.length) * 100,
    }));

    return {
      onTimeDelivery,
      budgetAdherence,
      profitabilityAnalysis,
      resourceUtilization,
      projectStatusDistribution,
    };
  }

  /**
   * Get time analytics
   */
  async getTimeAnalytics(filter?: AnalyticsFilter): Promise<TimeAnalytics> {
    const [allTimeEntries, allProjects] = await Promise.all([
      timeTrackingService.getAllTimeEntries(),
      projectService.getAllProjects(),
    ]);

    const timeEntries = this.filterTimeEntries(allTimeEntries, filter);
    const projects = this.filterProjects(allProjects, filter);

    // Daily hours
    const dailyHours = this.calculateDailyHours(timeEntries);

    // Weekly trends
    const weeklyTrends = this.calculateWeeklyTrends(timeEntries);

    // Monthly breakdown
    const monthlyBreakdown = this.calculateMonthlyTimeBreakdown(timeEntries);

    // Project time allocation
    const projectTimeAllocation = this.calculateProjectTimeAllocation(
      projects,
      timeEntries
    );

    // Overtime analysis
    const overtimeAnalysis = this.calculateOvertimeAnalysis(
      timeEntries,
      projectTimeAllocation
    );

    return {
      dailyHours,
      weeklyTrends,
      monthlyBreakdown,
      projectTimeAllocation,
      overtimeAnalysis,
    };
  }

  /**
   * Get trend analytics
   */
  async getTrendAnalytics(filter?: AnalyticsFilter): Promise<TrendAnalytics> {
    const [allProjects, allClients, allTimeEntries] = await Promise.all([
      projectService.getAllProjects(),
      clientService.getAllClients(),
      timeTrackingService.getAllTimeEntries(),
    ]);

    // Calculate trends over the last 12 months
    const revenueGrowth = this.calculateRevenueGrowthTrend(allTimeEntries);
    const clientGrowth = this.calculateClientGrowthTrend(allClients);
    const projectVolume = this.calculateProjectVolumeTrend(allProjects);
    const productivityTrends = this.calculateProductivityTrends(allTimeEntries);
    const seasonalPatterns = this.calculateSeasonalPatterns(
      allTimeEntries,
      allProjects
    );

    return {
      revenueGrowth,
      clientGrowth,
      projectVolume,
      productivityTrends,
      seasonalPatterns,
    };
  }

  // Helper methods for calculations
  private filterProjects(
    projects: Project[],
    filter?: AnalyticsFilter
  ): Project[] {
    if (!filter) return projects;

    return projects.filter(project => {
      if (filter.dateRange) {
        const projectDate = new Date(project.createdAt);
        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);
        if (projectDate < startDate || projectDate > endDate) return false;
      }

      if (filter.projects && !filter.projects.includes(project.id))
        return false;
      if (filter.clients && !filter.clients.includes(project.clientId))
        return false;
      if (!filter.includeArchived && project.status === 'cancelled')
        return false;

      return true;
    });
  }

  private filterClients(clients: Client[], filter?: AnalyticsFilter): Client[] {
    if (!filter) return clients;

    return clients.filter(client => {
      if (filter.dateRange) {
        const clientDate = new Date(client.createdAt);
        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);
        if (clientDate < startDate || clientDate > endDate) return false;
      }

      if (filter.clients && !filter.clients.includes(client.id)) return false;
      if (!filter.includeArchived && client.status === 'archived') return false;

      return true;
    });
  }

  private filterTasks(tasks: Task[], filter?: AnalyticsFilter): Task[] {
    if (!filter) return tasks;

    return tasks.filter(task => {
      if (filter.dateRange) {
        const taskDate = new Date(task.createdAt);
        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);
        if (taskDate < startDate || taskDate > endDate) return false;
      }

      if (filter.projects && !filter.projects.includes(task.projectId))
        return false;
      if (
        filter.users &&
        !task.assignedTo.some(userId => filter.users!.includes(userId))
      )
        return false;

      return true;
    });
  }

  private filterTimeEntries(
    timeEntries: TimeEntry[],
    filter?: AnalyticsFilter
  ): TimeEntry[] {
    if (!filter) return timeEntries;

    return timeEntries.filter(entry => {
      if (filter.dateRange) {
        const entryDate = new Date(entry.createdAt);
        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);
        if (entryDate < startDate || entryDate > endDate) return false;
      }

      if (filter.projects && !filter.projects.includes(entry.projectId))
        return false;
      if (filter.users && !filter.users.includes(entry.userId)) return false;

      return true;
    });
  }

  private calculateMonthlyRevenue(
    timeEntries: TimeEntry[],
    projects: Project[]
  ): MonthlyRevenue[] {
    const monthlyData = new Map<
      string,
      { revenue: number; billableHours: number; projectsCompleted: number }
    >();

    timeEntries.forEach(entry => {
      const month = entry.createdAt.slice(0, 7);
      const existing = monthlyData.get(month) || {
        revenue: 0,
        billableHours: 0,
        projectsCompleted: 0,
      };

      if (entry.billable && entry.hourlyRate) {
        existing.revenue += (entry.duration / 60) * entry.hourlyRate;
        existing.billableHours += entry.duration / 60;
      }

      monthlyData.set(month, existing);
    });

    // Add completed projects count
    projects.forEach(project => {
      if (project.status === 'completed' && project.endDate) {
        const month = project.endDate.slice(0, 7);
        const existing = monthlyData.get(month) || {
          revenue: 0,
          billableHours: 0,
          projectsCompleted: 0,
        };
        existing.projectsCompleted += 1;
        monthlyData.set(month, existing);
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        billableHours: data.billableHours,
        projectsCompleted: data.projectsCompleted,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateProjectRevenue(
    projects: Project[],
    timeEntries: TimeEntry[]
  ): ProjectRevenue[] {
    return projects.map(project => {
      const projectTimeEntries = timeEntries.filter(
        entry => entry.projectId === project.id
      );
      const revenue = projectTimeEntries
        .filter(entry => entry.billable && entry.hourlyRate)
        .reduce(
          (sum, entry) => sum + (entry.duration / 60) * (entry.hourlyRate || 0),
          0
        );

      const totalCost = project.totalSpent || 0;
      const profitability =
        revenue > 0 ? ((revenue - totalCost) / revenue) * 100 : 0;
      const completionPercentage =
        project.taskCount && project.completedTasks
          ? (project.completedTasks / project.taskCount) * 100
          : 0;

      return {
        projectId: project.id,
        projectTitle: project.title,
        revenue,
        profitability,
        completionPercentage,
      };
    });
  }

  private calculateClientRevenue(
    clients: Client[],
    projects: Project[],
    timeEntries: TimeEntry[]
  ): ClientRevenue[] {
    return clients.map(client => {
      const clientProjects = projects.filter(p => p.clientId === client.id);
      const clientTimeEntries = timeEntries.filter(entry =>
        clientProjects.some(p => p.id === entry.projectId)
      );

      const revenue = clientTimeEntries
        .filter(entry => entry.billable && entry.hourlyRate)
        .reduce(
          (sum, entry) => sum + (entry.duration / 60) * (entry.hourlyRate || 0),
          0
        );

      const averageProjectValue =
        clientProjects.length > 0 ? revenue / clientProjects.length : 0;

      return {
        clientId: client.id,
        clientName: client.name,
        revenue,
        projectCount: clientProjects.length,
        averageProjectValue,
      };
    });
  }

  private calculateProjectProfitability(
    projects: Project[],
    timeEntries: TimeEntry[]
  ): ProjectProfitability[] {
    return projects.map(project => {
      const projectTimeEntries = timeEntries.filter(
        entry => entry.projectId === project.id
      );
      const revenue = projectTimeEntries
        .filter(entry => entry.billable && entry.hourlyRate)
        .reduce(
          (sum, entry) => sum + (entry.duration / 60) * (entry.hourlyRate || 0),
          0
        );

      const costs = project.totalSpent || 0;
      const profit = revenue - costs;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        projectId: project.id,
        projectTitle: project.title,
        revenue,
        costs,
        profit,
        profitMargin,
      };
    });
  }

  private calculateDailyHours(timeEntries: TimeEntry[]): DailyHours[] {
    const dailyData = new Map<
      string,
      { total: number; billable: number; nonBillable: number }
    >();

    timeEntries.forEach(entry => {
      const date = entry.createdAt.slice(0, 10);
      const existing = dailyData.get(date) || {
        total: 0,
        billable: 0,
        nonBillable: 0,
      };
      const hours = entry.duration / 60;

      existing.total += hours;
      if (entry.billable) {
        existing.billable += hours;
      } else {
        existing.nonBillable += hours;
      }

      dailyData.set(date, existing);
    });

    return Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        totalHours: data.total,
        billableHours: data.billable,
        nonBillableHours: data.nonBillable,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateWeeklyTrends(timeEntries: TimeEntry[]): WeeklyTrend[] {
    const weeklyData = new Map<
      string,
      { hours: number; revenue: number; efficiency: number }
    >();

    timeEntries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const week = this.getWeekString(date);
      const existing = weeklyData.get(week) || {
        hours: 0,
        revenue: 0,
        efficiency: 0,
      };

      existing.hours += entry.duration / 60;
      if (entry.billable && entry.hourlyRate) {
        existing.revenue += (entry.duration / 60) * entry.hourlyRate;
      }

      weeklyData.set(week, existing);
    });

    return Array.from(weeklyData.entries())
      .map(([week, data]) => ({
        week,
        totalHours: data.hours,
        revenue: data.revenue,
        efficiency: data.hours > 0 ? data.revenue / data.hours : 0,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  private calculateMonthlyTimeBreakdown(
    timeEntries: TimeEntry[]
  ): MonthlyTimeBreakdown[] {
    const monthlyData = new Map<
      string,
      { total: number; billable: number; overtime: number; days: Set<string> }
    >();

    timeEntries.forEach(entry => {
      const month = entry.createdAt.slice(0, 7);
      const day = entry.createdAt.slice(0, 10);
      const existing = monthlyData.get(month) || {
        total: 0,
        billable: 0,
        overtime: 0,
        days: new Set(),
      };

      const hours = entry.duration / 60;
      existing.total += hours;
      existing.days.add(day);

      if (entry.billable) {
        existing.billable += hours;
      }

      // Consider overtime as hours > 8 per day (simplified)
      if (hours > 8) {
        existing.overtime += hours - 8;
      }

      monthlyData.set(month, existing);
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        totalHours: data.total,
        billableHours: data.billable,
        overtimeHours: data.overtime,
        averageDailyHours: data.days.size > 0 ? data.total / data.days.size : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateProjectTimeAllocation(
    projects: Project[],
    timeEntries: TimeEntry[]
  ): ProjectTimeAllocation[] {
    return projects.map(project => {
      const projectTimeEntries = timeEntries.filter(
        entry => entry.projectId === project.id
      );
      const actualHours = projectTimeEntries.reduce(
        (sum, entry) => sum + entry.duration / 60,
        0
      );
      const allocatedHours = project.estimatedHours || 0;
      const variance = actualHours - allocatedHours;

      return {
        projectId: project.id,
        projectTitle: project.title,
        allocatedHours,
        actualHours,
        variance,
      };
    });
  }

  private calculateOvertimeAnalysis(
    timeEntries: TimeEntry[],
    projectAllocations: ProjectTimeAllocation[]
  ): OvertimeAnalysis {
    const overtimeEntries = timeEntries.filter(
      entry => entry.duration > 8 * 60
    ); // More than 8 hours
    const totalOvertimeHours = overtimeEntries.reduce(
      (sum, entry) => sum + (entry.duration - 8 * 60) / 60,
      0
    );
    const totalHours = timeEntries.reduce(
      (sum, entry) => sum + entry.duration / 60,
      0
    );
    const overtimePercentage =
      totalHours > 0 ? (totalOvertimeHours / totalHours) * 100 : 0;
    const costOfOvertime = totalOvertimeHours * 75; // Estimated overtime rate

    const topOvertimeProjects = projectAllocations
      .filter(p => p.variance > 0)
      .sort((a, b) => b.variance - a.variance)
      .slice(0, 5);

    return {
      totalOvertimeHours,
      overtimePercentage,
      costOfOvertime,
      topOvertimeProjects,
    };
  }

  private calculateRevenueGrowthTrend(timeEntries: TimeEntry[]): GrowthTrend[] {
    const monthlyRevenue = new Map<string, number>();

    timeEntries.forEach(entry => {
      if (entry.billable && entry.hourlyRate) {
        const month = entry.createdAt.slice(0, 7);
        const revenue = (entry.duration / 60) * entry.hourlyRate;
        monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + revenue);
      }
    });

    const sortedMonths = Array.from(monthlyRevenue.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    return sortedMonths.map(([period, value], index) => {
      const previousValue = index > 0 ? sortedMonths[index - 1][1] : value;
      const growth =
        previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0;

      return { period, value, growth };
    });
  }

  private calculateClientGrowthTrend(clients: Client[]): GrowthTrend[] {
    const monthlyClients = new Map<string, number>();

    clients.forEach(client => {
      const month = client.createdAt.slice(0, 7);
      monthlyClients.set(month, (monthlyClients.get(month) || 0) + 1);
    });

    const sortedMonths = Array.from(monthlyClients.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    let cumulative = 0;

    return sortedMonths.map(([period, newClients], index) => {
      cumulative += newClients;
      const previousValue = index > 0 ? sortedMonths[index - 1][1] : newClients;
      const growth =
        previousValue > 0
          ? ((newClients - previousValue) / previousValue) * 100
          : 0;

      return { period, value: cumulative, growth };
    });
  }

  private calculateProjectVolumeTrend(projects: Project[]): GrowthTrend[] {
    const monthlyProjects = new Map<string, number>();

    projects.forEach(project => {
      const month = project.createdAt.slice(0, 7);
      monthlyProjects.set(month, (monthlyProjects.get(month) || 0) + 1);
    });

    const sortedMonths = Array.from(monthlyProjects.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    return sortedMonths.map(([period, value], index) => {
      const previousValue = index > 0 ? sortedMonths[index - 1][1] : value;
      const growth =
        previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0;

      return { period, value, growth };
    });
  }

  private calculateProductivityTrends(
    timeEntries: TimeEntry[]
  ): ProductivityTrend[] {
    const monthlyData = new Map<
      string,
      { hours: number; revenue: number; entries: number }
    >();

    timeEntries.forEach(entry => {
      const month = entry.createdAt.slice(0, 7);
      const existing = monthlyData.get(month) || {
        hours: 0,
        revenue: 0,
        entries: 0,
      };

      existing.hours += entry.duration / 60;
      existing.entries += 1;
      if (entry.billable && entry.hourlyRate) {
        existing.revenue += (entry.duration / 60) * entry.hourlyRate;
      }

      monthlyData.set(month, existing);
    });

    return Array.from(monthlyData.entries())
      .map(([period, data]) => ({
        period,
        tasksCompleted: data.entries,
        averageCompletionTime: data.entries > 0 ? data.hours / data.entries : 0,
        efficiency: data.hours > 0 ? data.revenue / data.hours : 0,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private calculateSeasonalPatterns(
    timeEntries: TimeEntry[],
    projects: Project[]
  ): SeasonalPattern[] {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

    return quarters.map(quarter => {
      const quarterMonths = this.getQuarterMonths(quarter);
      const quarterEntries = timeEntries.filter(entry => {
        const month = parseInt(entry.createdAt.slice(5, 7));
        return quarterMonths.includes(month);
      });

      const quarterProjects = projects.filter(project => {
        const month = parseInt(project.createdAt.slice(5, 7));
        return quarterMonths.includes(month);
      });

      const revenue = quarterEntries
        .filter(entry => entry.billable && entry.hourlyRate)
        .reduce(
          (sum, entry) => sum + (entry.duration / 60) * (entry.hourlyRate || 0),
          0
        );

      const avgRevenue =
        timeEntries.length > 0
          ? timeEntries
              .filter(entry => entry.billable && entry.hourlyRate)
              .reduce(
                (sum, entry) =>
                  sum + (entry.duration / 60) * (entry.hourlyRate || 0),
                0
              ) / 4
          : 0;

      let pattern: 'peak' | 'normal' | 'low' = 'normal';
      if (revenue > avgRevenue * 1.2) pattern = 'peak';
      else if (revenue < avgRevenue * 0.8) pattern = 'low';

      return {
        period: quarter,
        revenue,
        projectVolume: quarterProjects.length,
        pattern,
      };
    });
  }

  private getWeekString(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  private getQuarterMonths(quarter: string): number[] {
    switch (quarter) {
      case 'Q1':
        return [1, 2, 3];
      case 'Q2':
        return [4, 5, 6];
      case 'Q3':
        return [7, 8, 9];
      case 'Q4':
        return [10, 11, 12];
      default:
        return [];
    }
  }
}

export const analyticsService = new AnalyticsService();
