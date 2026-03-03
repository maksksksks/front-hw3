import axios from "axios";
import qs from "qs";
import type { Film, FilmsResponse } from "./FilmService";

const STRAPI_BASE_URL = 'https://front-school-strapi.ktsdev.ru';
export const STRAPI_URL = `${STRAPI_BASE_URL}/api`;


export interface SingleFilmResponse {
    data: Film;
    meta: {};
}

export interface FilmsQueryParams {
    page?: number;
    pageSize?: number;
    search?: string;
    genres?: string[];
    excludeId?: string;
    yearRange?: { min: number; max: number };
    ids?: string[];
}

export const fetchFilmById = async (documentId: string): Promise<Film> => {
    const query = qs.stringify({
        populate: ["poster", "category", "gallery"],
    }, { encodeValuesOnly: true });

    const { data } = await axios.get<SingleFilmResponse>(`${STRAPI_URL}/films/${documentId}?${query}`);
    return data.data;
};

export const fetchFilms = async (params: FilmsQueryParams): Promise<FilmsResponse> => {
    const { page = 1, pageSize = 9, search, genres, excludeId, yearRange, ids } = params;

    const filters: any = {};

    if (search) {
        filters.title = { $containsi: search };
    }

    if (genres && genres.length > 0) {
        filters.category = { slug: { $in: genres } };
    }

    if (yearRange) {
        filters.releaseYear = {
            $gte: yearRange.min,
            $lte: yearRange.max
        };
    }
    if (excludeId) {
        filters.documentId = { $ne: excludeId };
    }

    if (ids && ids.length > 0) {
        filters.documentId = { $in: ids };
    }

    const query = qs.stringify(
        {
            populate: ["poster", "category"],
            filters,
            pagination: { page, pageSize },
        },
        { encodeValuesOnly: true }
    );

    const { data } = await axios.get<FilmsResponse>(`${STRAPI_URL}/films?${query}`);
    return data;
};