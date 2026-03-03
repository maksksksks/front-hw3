// CinemaPage.tsx
import Text from "@components/Text";
import styles from "./CinemaPage.module.scss";
import Button from "@components/Button";
import Card from "@components/Card";
import Input from "./components/Input";
import MultiDropdown, { type Option } from "./components/MultiDropdown";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router"; // Используем useSearchParams
import CinemaLayout from "../Layout/CinemaLayout";
import { useFilms } from "@hooks/useFilms"; // Наш хук
import { useFavorites } from "@hooks/useFavorites"; // Хук избранного
import { STRAPI_URL } from "@/services/Films";


// Опции жанров (лучше вынести в константы или загружать с бэка)
const genreOptions: Option[] = [
    { key: 'fantasy', value: 'Фэнтези' },
    { key: 'drama', value: 'Драма' },
    { key: 'comedy', value: 'Комедия' },
    { key: 'thriller', value: 'Триллер' },
];

const CinemaPage = () => {
    // Работа с Query-параметрами (URL)
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Читаем состояние из URL
    const currentPage = Number(searchParams.get('page')) || 1;
    const searchQuery = searchParams.get('search') || '';
    const selectedGenreKeys = searchParams.get('genres')?.split(',').filter(Boolean) || [];

    // Локальное состояние для инпута поиска (для мгновенного отклика ввода)
    const [inputValue, setInputValue] = useState(searchQuery);

    // Преобразуем ключи жанров в объекты Option для MultiDropdown
    const selectedGenres = useMemo(() => {
        return genreOptions.filter(opt => selectedGenreKeys.includes(opt.key));
    }, [selectedGenreKeys]);

    // Хуки
    const { data, isLoading, isError } = useFilms({
        page: currentPage,
        search: searchQuery, // В запрос уходит то, что в URL
        genres: selectedGenreKeys,
    });

    const { toggleFavorite, isFavorite } = useFavorites();

    // Обработчики
    const handleSearch = () => {
        // При нажатии "Найти" обновляем URL
        const params = new URLSearchParams(searchParams);
        params.set('search', inputValue);
        params.set('page', '1');
        setSearchParams(params);
    };

    const handleGenreChange = (value: Option[]) => {
        const params = new URLSearchParams(searchParams);
        const keys = value.map(v => v.key);
        
        if (keys.length > 0) {
            params.set('genres', keys.join(','));
        } else {
            params.delete('genres');
        }
        params.set('page', '1');
        setSearchParams(params);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(page));
        setSearchParams(params);
        window.scrollTo(0, 0);
    };

    const films = data?.data || [];
    const total = data?.meta.pagination.total || 0;
    const pageCount = data?.meta.pagination.pageCount || 1;

    return (
        <CinemaLayout>
            <div className={styles.content}>
                <div className={styles.texts}>
                    <Text tag="p" className={styles.title}>Cinema</Text>
                    <Text tag="p" className={styles.subtitle}>
                        Подборка для вечера уже здесь: фильмы, сериалы и новинки.
                        <br />
                        Найди что посмотреть — за пару секунд.
                    </Text>
                </div>

                <div className={styles.filters}>
                    <div className={styles.search}>
                        <Input
                            onChange={setInputValue}
                            value={inputValue}
                            placeholder="Искать фильм"
                            className={styles.searchInput}
                        />
                        <Button 
                            className={styles.searchButton}
                            onClick={handleSearch}
                        >
                            Найти
                        </Button>
                    </div>

                    <MultiDropdown
                        className={styles.MultiDropdownFilters}
                        options={genreOptions}
                        value={selectedGenres}
                        onChange={handleGenreChange}
                        getTitle={(value) =>
                            value.length === 0
                                ? 'Фильтры'
                                : value.map(v => v.value).join(', ')
                        }
                    />
                    
                    <div className={styles.filmsTitle}>
                        <Text color="primary" view="p-32" weight="bold" tag="h1">
                            Все фильмы
                        </Text>
                        <Text color="red" view="p-20-mono" weight="bold">
                            {total}
                        </Text>
                    </div>
                </div>

                <div className={styles.recommendations}>
                    <div className={styles.cards}>
                        {isLoading && (
                            <>
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className={styles.skeletonCard}>
                                        <div className={styles.skeletonImage}></div>
                                        <div className={styles.skeletonText}></div>
                                        <div className={styles.skeletonTextShort}></div>
                                    </div>
                                ))}
                            </>
                        )}

                        {isError && <div>Ошибка загрузки данных. Попробуйте позже.</div>}

                        {!isLoading && films.length === 0 && (
                            <div>Фильмы не найдены.</div>
                        )}

                        {films.map((film) => {
                            const imageUrl = film.poster?.url 
                                ? `${STRAPI_URL}${film.poster.url}` 
                                : "@assets/Rectangle 50.png"; 

                            return (
                                <Card
                                    key={film.id}
                                    image={imageUrl}
                                    rating={<>{film.rating}</>}
                                    label={`${film.duration} мин`}
                                    meta={`${film.releaseYear} • ${film.ageLimit}+`}
                                    title={film.title}
                                    subtitle={film.shortDescription}
                                    secondaryAction={
                                        <Button 
                                            variant="outlined" 
                                            textColor={isFavorite(film.documentId) ? "red" : "primary"} 
                                            onClick={() => toggleFavorite(film.documentId)}
                                        >
                                            {isFavorite(film.documentId) ? "В избранном" : "В избранное"}
                                        </Button>
                                    }
                                    primaryAction={
                                        <Link to={`/films/${film.documentId}`}>
                                            <Button variant="filled">Смотреть</Button>
                                        </Link>
                                    }
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                {!isLoading && films.length > 0 && pageCount > 1 && (
                    <div className={styles.paginator}>
                        <Button
                            variant="outlined"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Предыдущая
                        </Button>

                        <div className={styles.pagesButtons}>
                            {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    variant={page === currentPage ? "filled" : "outlined"}
                                    onClick={() => handlePageChange(page)}
                                    style={{ minWidth: "48px" }}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outlined"
                            disabled={currentPage === pageCount}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Следующая
                        </Button>
                    </div>
                )}
            </div>
        </CinemaLayout>
    )
}

export default CinemaPage;