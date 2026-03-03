// src/App/pages/FavoritesPage/FavoritesPage.tsx
import Text from "@components/Text";
import styles from "./FavoritesPage.module.scss"; // Создадим этот файл следующим
import Button from "@components/Button";
import Card from "@components/Card";
import { Link } from "react-router";
import CinemaLayout from "../Layout/CinemaLayout";
import { useFavorites } from "@hooks/useFavorites";
import { useFilms } from "@hooks/useFilms"; // Наш хук для получения фильмов
import { STRAPI_URL } from "@services/Films";
import cover1 from "@assets/Rectangle 25.png"; // Заглушка

const FavoritesPage = () => {
    // 1. Получаем список ID избранного
    const { favorites, toggleFavorite, isFavorite } = useFavorites();

    const { data, isLoading, isError } = useFilms({ 
        ids: favorites,
        pageSize: 100 
    }, { 
        enabled: favorites.length > 0 
    });

    // Если избранного нет, data будет undefined, films будет пустым массивом
    const films = data?.data || [];

    const displayedFilms = films.filter(film => favorites.includes(film.documentId));

    // Состояния рендера
    const renderContent = () => {
        if (favorites.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <Text tag="p" view="p-20" color="secondary">
                        Вы еще не добавили ни одного фильма в избранное.
                    </Text>
                    <Link to="/films">
                        <Button variant="filled">Смотреть фильмы</Button>
                    </Link>
                </div>
            );
        }

        if (isLoading) {
            return <div className={styles.loading}>Загрузка избранного...</div>;
        }

        if (isError) {
            return <div className={styles.error}>Ошибка при загрузке данных.</div>;
        }

        return (
            <div className={styles.cards}>
                {displayedFilms.map((film) => {
                    const imageUrl = film.poster?.url 
                        ? `${STRAPI_URL}${film.poster.url}` 
                        : cover1;

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
                                    textColor="red" 
                                    onClick={() => toggleFavorite(film.documentId)}
                                >
                                    Удалить
                                </Button>
                            }
                            primaryAction={
                                <Link to={`/films/${film.documentId}`}>
                                    <Button variant="filled">
                                        Смотреть
                                    </Button>
                                </Link>
                            }
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <CinemaLayout>
            <div className={styles.content}>
                <div className={styles.header}>
                    <Text tag="h1" view="p-32" weight="bold" color="primary">
                        Избранное
                    </Text>
                    <Text tag="span" view="p-20-mono" color="red" weight="bold">
                        {favorites.length}
                    </Text>
                </div>

                {renderContent()}
            </div>
        </CinemaLayout>
    );
};

export default FavoritesPage;