export interface IAdmin {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

export type ReportStatus = 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
export type ReportPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface IReport {
  _id: string;
  reportNumber: string;
  title: string;
  category: string;
  reportDate: string;
  description: string;
  findings: string;
  recommendations: string;
  status: ReportStatus;
  priority: ReportPriority;
  tags: string[];
  reference?: string;
  customer?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilterOptions {
  search?: string;
  status?: ReportStatus;
  category?: string;
  priority?: ReportPriority;
  customer?: string;
  startDate?: string;
  endDate?: string;
  archived?: boolean;
  sortBy?: 'reportDate' | 'createdAt' | 'reportNumber' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
