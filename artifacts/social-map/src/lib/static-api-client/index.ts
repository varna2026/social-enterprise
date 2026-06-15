import { useQuery } from "@tanstack/react-query";
import type {
  Enterprise,
  EnterpriseStats,
  ListEnterprisesParams,
} from "@workspace/api-client-react/src/generated/api.schemas";

export * from "@workspace/api-client-react/src/generated/api.schemas";

const BASE = import.meta.env.BASE_URL || "/";

let _cache: Enterprise[] | null = null;

async function loadEnterprises(): Promise<Enterprise[]> {
  if (_cache) return _cache;
  const res = await fetch(`${BASE}data/enterprises.json`);
  if (!res.ok) throw new Error("Cannot load enterprises.json");
  _cache = (await res.json()) as Enterprise[];
  return _cache;
}

function transformImageUrl(url: string): string {
  if (url.includes("/api/storage/objects/uploads/")) {
    const uuid = url.split("/").pop();
    return `${BASE}data/images/${uuid}`;
  }
  return url;
}

function transformImages(
  raw: string | null | undefined
): string | null | undefined {
  if (!raw) return raw;
  try {
    const arr: string[] = JSON.parse(raw);
    return JSON.stringify(arr.map(transformImageUrl));
  } catch {
    return raw;
  }
}

function applyFilters(
  list: Enterprise[],
  params?: ListEnterprisesParams
): Enterprise[] {
  let result = list;
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.naimenovanie?.toLowerCase().includes(q) ||
        e.kratkoOpisanie?.toLowerCase().includes(q) ||
        e.grad?.toLowerCase().includes(q) ||
        (e.adres ?? "").toLowerCase().includes(q)
    );
  }
  if (params?.oblast)
    result = result.filter((e) => e.oblast === params.oblast);
  if (params?.ikonomicheskaDeynost)
    result = result.filter(
      (e) => e.ikonomicheskaDeynost === params.ikonomicheskaDeynost
    );
  if (params?.socialnaKauza)
    result = result.filter((e) => e.socialnaKauza === params.socialnaKauza);
  if (params?.klas) result = result.filter((e) => e.klas === params.klas);
  return result;
}

function transform(e: Enterprise): Enterprise {
  return { ...e, images: transformImages(e.images) };
}

export function useListEnterprises(
  params?: ListEnterprisesParams,
  options?: { query?: object }
) {
  const queryKey = ["static-enterprises", params] as const;
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const all = await loadEnterprises();
      return applyFilters(all, params).map(transform);
    },
    staleTime: Infinity,
    ...(options?.query as object),
  });
  return { ...query, queryKey };
}

export function useGetEnterprise(
  id: number,
  options?: { query?: { enabled?: boolean } }
) {
  const queryKey = ["static-enterprise", id] as const;
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const all = await loadEnterprises();
      const found = all.find((e) => e.id === id);
      if (!found) throw new Error("Enterprise not found");
      return transform(found);
    },
    enabled: options?.query?.enabled !== false && Boolean(id),
    staleTime: Infinity,
  });
  return { ...query, queryKey };
}

export function useGetEnterpriseStats(options?: { query?: object }) {
  const queryKey = ["static-enterprise-stats"] as const;
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<EnterpriseStats> => {
      const all = await loadEnterprises();
      return {
        totalEnterprises: all.length,
        totalZaeti: all.reduce((s, e) => s + (e.broyZaeti ?? 0), 0),
        totalUyazvimiLica: all.reduce(
          (s, e) => s + (e.broyUyazvimiLica ?? 0),
          0
        ),
        totalInovacii: all.filter((e) => e.socialnaInovaciya).length,
        totalKauzi: new Set(all.map((e) => e.socialnaKauza)).size,
        totalSabytiya: 0,
      };
    },
    staleTime: Infinity,
    ...(options?.query as object),
  });
  return { ...query, queryKey };
}

export function useGetEnterprisesByOblast(options?: { query?: object }) {
  const queryKey = ["static-by-oblast"] as const;
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const all = await loadEnterprises();
      const counts: Record<string, number> = {};
      all.forEach((e) => {
        counts[e.oblast] = (counts[e.oblast] ?? 0) + 1;
      });
      return Object.entries(counts).map(([oblast, count]) => ({
        oblast,
        count,
      }));
    },
    staleTime: Infinity,
    ...(options?.query as object),
  });
  return { ...query, queryKey };
}

export function useGetEnterprisesBySector(options?: { query?: object }) {
  const queryKey = ["static-by-sector"] as const;
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const all = await loadEnterprises();
      const counts: Record<string, number> = {};
      all.forEach((e) => {
        counts[e.ikonomicheskaDeynost] =
          (counts[e.ikonomicheskaDeynost] ?? 0) + 1;
      });
      return Object.entries(counts).map(([sector, count]) => ({
        sector,
        count,
      }));
    },
    staleTime: Infinity,
    ...(options?.query as object),
  });
  return { ...query, queryKey };
}

export function useGetEnterprisesByKauza(options?: { query?: object }) {
  const queryKey = ["static-by-kauza"] as const;
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const all = await loadEnterprises();
      const counts: Record<string, number> = {};
      all.forEach((e) => {
        counts[e.socialnaKauza] = (counts[e.socialnaKauza] ?? 0) + 1;
      });
      return Object.entries(counts).map(([kauza, count]) => ({
        kauza,
        count,
      }));
    },
    staleTime: Infinity,
    ...(options?.query as object),
  });
  return { ...query, queryKey };
}

export function useListEvents(options?: { query?: object }) {
  const queryKey = ["static-events"] as const;
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`${BASE}data/events.json`);
      if (!res.ok) throw new Error("Cannot load events.json");
      return res.json();
    },
    staleTime: Infinity,
    ...(options?.query as object),
  });
  return { ...query, queryKey };
}

const noop = () => { throw new Error("Not available in static mode"); };

export const useCreateEnterprise = () => ({ mutate: noop, mutateAsync: noop, isPending: false });
export const useUpdateEnterprise = () => ({ mutate: noop, mutateAsync: noop, isPending: false });
export const useDeleteEnterprise = () => ({ mutate: noop, mutateAsync: noop, isPending: false });
export const useCreateEvent = () => ({ mutate: noop, mutateAsync: noop, isPending: false });
export const useUpdateEvent = () => ({ mutate: noop, mutateAsync: noop, isPending: false });
export const useDeleteEvent = () => ({ mutate: noop, mutateAsync: noop, isPending: false });
export const useUploadImages = () => ({ mutate: noop, mutateAsync: noop, isPending: false });
export const useDeleteImage = () => ({ mutate: noop, mutateAsync: noop, isPending: false });

export const getListEnterprisesQueryKey = (params?: object) =>
  ["static-enterprises", params] as const;
export const getListEventsQueryKey = () => ["static-events"] as const;
export const getGetEnterpriseQueryKey = (id: number) => ["static-enterprise", id] as const;
