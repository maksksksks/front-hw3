// src/hooks/useFavorites.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const FAVORITES_KEY = 'cinema_favorites';

// Вспомогательная функция для получения данных (для useQuery)
const getFavorites = async (): Promise<string[]> => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
};

// Вспомогательная функция для сохранения (для mutation)
const saveFavorites = async (ids: string[]): Promise<string[]> => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    return ids;
};

export const useFavorites = () => {
    const queryClient = useQueryClient();

    const { data: favorites = [] } = useQuery({
        queryKey: ['favorites'],
        queryFn: getFavorites,
        initialData: () => {
            const saved = localStorage.getItem(FAVORITES_KEY);
            return saved ? JSON.parse(saved) : [];
        },
    });

    const mutation = useMutation({
        mutationFn: saveFavorites,
        onSuccess: (newData) => {
            queryClient.setQueryData(['favorites'], newData);
        },
    });

    const toggleFavorite = (id: string) => {
        const currentFavorites = queryClient.getQueryData<string[]>(['favorites']) || [];
        const isExist = currentFavorites.includes(id);
        
        const newList = isExist
            ? currentFavorites.filter((fid) => fid !== id)
            : [...currentFavorites, id];
            
        // Запускаем мутацию
        mutation.mutate(newList);
    };

    const isFavorite = (id: string) => favorites.includes(id);

    return { 
        favorites, 
        toggleFavorite, 
        isFavorite,
        isLoading: mutation.isPending
    };
};