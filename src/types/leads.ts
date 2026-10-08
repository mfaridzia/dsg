export interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  company?: string | null;
  interest?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  createdAt: number;
}

export interface LeadSubmissionPayload {
  name: string;
  email: string;
  whatsapp: string;
  company?: string;
  interest?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

export interface LeadsApiResponse {
  success: boolean;
  data?: Lead[];
  lead?: Lead;
  error?: string;
}
