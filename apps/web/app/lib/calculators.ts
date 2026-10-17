import type { CalculatorId, TopicId } from "@elektro/shared";
import { ApiError, apiFetch } from "./api";

/** A calculator as the registry lists it (plan §2.2, Q21). */
export interface ListedCalculator {
  id: CalculatorId;
  topicId: TopicId;
  position: number;
  published: boolean;
  title: string | null;
  description: string | null;
  /** Page path below the locale prefix. */
  path: string;
}

/** Published calculators in list order, optionally of one topic. */
export async function listCalculators(
  request: Request,
  locale: string,
  topicId?: TopicId,
): Promise<ListedCalculator[]> {
  const query = new URLSearchParams({ locale, ...(topicId ? { topicId } : {}) });
  const { calculators } = await apiFetch<{ calculators: ListedCalculator[] }>(
    request,
    `/api/calculators?${query.toString()}`,
  );
  return calculators;
}

/**
 * One calculator for its page; a 404 when it is not listed or not published
 * (teachers and admins may preview unpublished ones).
 */
export async function loadCalculator(
  request: Request,
  locale: string,
  id: CalculatorId,
): Promise<ListedCalculator> {
  try {
    const { calculator } = await apiFetch<{ calculator: ListedCalculator }>(
      request,
      `/api/calculators/${id}?${new URLSearchParams({ locale }).toString()}`,
    );
    return calculator;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Response(null, { status: 404 });
    }
    throw error;
  }
}
