/** Transcribed from the backend's kyc.enums.KycStatus. */
export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Transcribed from the backend's kyc.enums.IdDocumentType. */
export type IdDocumentType = "PASSPORT" | "DRIVERS_LICENSE" | "NATIONAL_ID" | "OTHER";

/** The caller's own view of their KYC submission (GET /kyc/me, POST /kyc/submit). */
export interface KycSubmissionResponseDto {
  id: number;
  status: KycStatus;
  legalName: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  idDocumentType: IdDocumentType;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Text fields for POST /kyc/submit — sent alongside the two document files. */
export interface SubmitKycRequest {
  legalName: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  idDocumentType: IdDocumentType;
}

export interface AdminKycSummaryResponse {
  id: number;
  userId: number;
  userEmail: string;
  legalName: string;
  status: KycStatus;
  createdAt: string;
}

export interface AdminKycListResponse {
  submissions: AdminKycSummaryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Full submission detail for admin review, including short-lived document URLs. */
export interface AdminKycDetailResponse {
  id: number;
  userId: number;
  userEmail: string;
  legalName: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  idDocumentType: IdDocumentType;
  idDocumentImageUrl: string;
  selfieImageUrl: string;
  status: KycStatus;
  rejectionReason: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IdDocumentTypeOption {
  value: IdDocumentType;
  label: string;
}

export const ID_DOCUMENT_TYPE_OPTIONS: IdDocumentTypeOption[] = [
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVERS_LICENSE", label: "Driver's license" },
  { value: "NATIONAL_ID", label: "National ID card" },
  { value: "OTHER", label: "Other government-issued ID" },
];

export interface CountryOption {
  code: string;
  label: string;
}

/** A pragmatic common-country subset, not the full ISO-3166 list. */
export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "US", label: "United States" },
  { code: "IN", label: "India" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "IT", label: "Italy" },
  { code: "NL", label: "Netherlands" },
  { code: "SE", label: "Sweden" },
  { code: "SG", label: "Singapore" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "JP", label: "Japan" },
  { code: "CN", label: "China" },
  { code: "BR", label: "Brazil" },
  { code: "MX", label: "Mexico" },
  { code: "ZA", label: "South Africa" },
  { code: "NG", label: "Nigeria" },
  { code: "NZ", label: "New Zealand" },
];
