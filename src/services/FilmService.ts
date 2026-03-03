// src/api/films.ts
import axios from "axios";
import qs from "qs";
import { STRAPI_URL, type FilmsQueryParams } from "./Films";


export interface Film {
  id: number;
  documentId: string;
  title: string;
  rating: number;
  duration: number;
  releaseYear: number;
  ageLimit: number;
  shortDescription: string;
  description: string;
  poster?: { url: string };
  category?: { name: string; slug: string };
}


export interface FilmsResponse {
    data: Film[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}
// Функция-фетчер для TanStack Query
export const fetchFilms = async (params: FilmsQueryParams): Promise<FilmsResponse> => {
    const { page = 1, pageSize = 9, search, genres } = params;

    const filters: any = {};

    if (search) {
        filters.title = { $containsi: search };
    }

    if (genres && genres.length > 0) {
        filters.category = { slug: { $in: genres } };
    }

    const query = qs.stringify(
        {
            populate: ["category", "poster", "gallery"],
            filters,
            pagination: { page, pageSize },
        },
        { encodeValuesOnly: true }
    );

    const { data } = await axios.get<FilmsResponse>(`${STRAPI_URL}/films?${query}`);
    return data;
};

export type { FilmsQueryParams };
