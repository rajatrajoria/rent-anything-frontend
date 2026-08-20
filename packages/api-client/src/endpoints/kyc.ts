import type {
  AdminKycDetailResponse,
  AdminKycListResponse,
  ApiResponse,
  KycStatus,
  KycSubmissionResponseDto,
  SubmitKycRequest,
} from "@rent-anything/types";
import { request } from "../httpClient";
import { API_BASE_URL } from "../config";
import { getAccessToken } from "../tokenStore";
import { ApiClientError, ApiUnreachableError } from "../errors";

export async function getMyKycSubmission(): Promise<KycSubmissionResponseDto | null> {
  return (await request<KycSubmissionResponseDto | null>("/kyc/me")) ?? null;
}

/**
 * Uses XMLHttpRequest instead of fetch, same as itemImages.ts's
 * uploadImages — this is a multipart request (text fields + two files),
 * which the generic JSON-only request() helper doesn't support.
 */
export function submitKyc(
  fields: SubmitKycRequest,
  idDocument: File,
  selfie: File
): Promise<KycSubmissionResponseDto> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("legalName", fields.legalName);
    formData.append("dateOfBirth", fields.dateOfBirth);
    formData.append("addressLine1", fields.addressLine1);
    if (fields.addressLine2) formData.append("addressLine2", fields.addressLine2);
    formData.append("city", fields.city);
    formData.append("state", fields.state);
    formData.append("postalCode", fields.postalCode);
    formData.append("country", fields.country);
    formData.append("idDocumentType", fields.idDocumentType);
    formData.append("idDocument", idDocument);
    formData.append("selfie", selfie);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/kyc/submit`);
    const accessToken = getAccessToken();
    if (accessToken) xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);

    xhr.onload = () => {
      let envelope: ApiResponse<KycSubmissionResponseDto>;
      try {
        envelope = JSON.parse(xhr.responseText);
      } catch (cause) {
        reject(new ApiUnreachableError(cause));
        return;
      }
      if (!envelope.success || !envelope.data) {
        reject(envelope.error ? new ApiClientError(envelope.error) : new ApiUnreachableError(new Error("Malformed error response")));
        return;
      }
      resolve(envelope.data);
    };

    xhr.onerror = () => reject(new ApiUnreachableError(new Error("Network error during upload")));

    xhr.send(formData);
  });
}

export interface AdminListKycParams {
  status?: KycStatus;
  page?: number;
  size?: number;
}

export async function adminListKycSubmissions(params: AdminListKycParams = {}): Promise<AdminKycListResponse> {
  return (await request<AdminKycListResponse>("/admin/kyc", {
    query: { status: params.status, page: params.page, size: params.size },
  }))!;
}

export async function adminGetKycSubmission(id: number): Promise<AdminKycDetailResponse> {
  return (await request<AdminKycDetailResponse>(`/admin/kyc/${id}`))!;
}

export async function adminApproveKyc(id: number): Promise<void> {
  await request<void>(`/admin/kyc/${id}/approve`, { method: "PATCH" });
}

export async function adminRejectKyc(id: number, reason: string): Promise<void> {
  await request<void>(`/admin/kyc/${id}/reject`, { method: "PATCH", body: { reason } });
}
