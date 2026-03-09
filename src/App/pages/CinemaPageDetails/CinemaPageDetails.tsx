// CinemaPageDetails.tsx
import Text from "@components/Text";
import cover1 from "@assets/Rectangle 23.png" // Дефолтная картинка
import styles from "./CinemaPageDetails.module.scss";
import Button from "@components/Button";
import BigCard from "./components/BigCard";
import ArrowRightIcon from "@components/icons/ArrowRightIcon";
import Card from "@components/Card";
import { useState } from "react";
import { Link, useParams } from "react-router";
import CinemaLayout from "../Layout/CinemaLayout";
import { useFilmDetails, useRecommendations } from "@hooks/useFilms"; // Наши новые хуки
import { useFavorites } from "@hooks/useFavorites"; // Хук избранного
import { STRAPI_URL } from "@services/FilmService"; // Импорт URL

const CinemaPageDetails = () => {
    const { documentId } = useParams<{ documentId: string }>();
    
    // Состояние для карусели (локальное UI состояние)
    const [currentIndex, setCurrentIndex] = useState(0);
    const ITEMS_PER_PAGE = 3;

    // 1. Запрос деталей фильма
    const { 
        data: film, 
        isLoading: isFilmLoading, 
        isError: isFilmError 
    } = useFilmDetails(documentId);

    // 2. Запрос рекомендаций (зависит от года выхода фильма)
    const { 
        data: recData, 
        isLoading: isRecLoading 
    } = useRecommendations(film?.releaseYear, film?.documentId);

    const { toggleFavorite, isFavorite } = useFavorites();

    
    if (isFilmLoading) {
        return (
            <CinemaLayout>
                <div className={styles.content}>
                    {/* Скелетон кнопки "Назад" */}
                    <div className={styles.skeletonBack} />

                    {/* Скелетон BigCard */}
                    <div className={styles.skeletonBigCard}>
                        <div className={styles.skeletonBigImage} />
                        
                        <div className={styles.skeletonBigCardBody}>
                            {/* textFrame1: Заголовок и Рейтинг */}
                            <div className={styles.skeletonTextFrame1}>
                                <div className={styles.skeletonTitle} />
                                <div className={styles.skeletonRating} />
                            </div>

                            {/* textFrame2: Год, жанр и т.д. */}
                            <div className={styles.skeletonTextFrame2} />

                            {/* textFrame3: Описание */}
                            <div className={styles.skeletonTextFrame3}>
                                <div className={styles.skeletonTextLine} />
                                <div className={styles.skeletonTextLine} />
                                <div className={styles.skeletonTextLine} />
                                <div className={styles.skeletonTextLineShort} />
                            </div>
                        </div>
                    </div>
                </div>
            </CinemaLayout>
        );
    }

    if (isFilmError || !film) {
        return (
            <CinemaLayout>
                <div className={styles.content}>
                    <Text tag="p" color="red">Ошибка загрузки или фильм не найден.</Text>
                    <Link to="/films"><Button>Назад к списку</Button></Link>
                </div>
            </CinemaLayout>
        );
    }

    // --- Данные ---
    
    const imageUrl = film.poster?.url 
        ? `${STRAPI_URL}${film.poster.url}` 
        : cover1;
    
    const recommendations = recData?.data || [];

    // --- Обработчики карусели ---

    const handlePrev = () => setCurrentIndex(prev => Math.max(0, prev - ITEMS_PER_PAGE));
    const handleNext = () => setCurrentIndex(prev => prev + ITEMS_PER_PAGE);
    const isPrevDisabled = currentIndex === 0;
    const isNextDisabled = currentIndex + ITEMS_PER_PAGE >= recommendations.length;

    return (
        <CinemaLayout>
            <div className={styles.content}>
                <Link to={`/films`}>
                    <div className={styles.back}>
                        <ArrowRightIcon width={32} height={32} />
                        <Text color="primary" view="p-20" tag="div">
                            Назад
                        </Text>
                    </div>
                </Link>

                <BigCard
                    image={imageUrl}
                    title={film.title}
                    description={film.description}
                    year={film.releaseYear}
                    genre={film.category?.name || "Неизвестно"}
                    age={film.ageLimit.toString()}
                    duration={`${film.duration} мин`}
                    rating={film.rating.toString()}
                />

                <div className={styles.recommendations}>
                    <Text color="primary" view="p-32" weight="bold" tag="h1">
                        Рекомендации
                    </Text>

                    {isRecLoading ? (
                        <div className={styles.skeletonRecs}>Загрузка рекомендаций...</div>
                    ) : recommendations.length === 0 ? (
                        <Text color="secondary" view="p-20">
                            Рекомендаций в диапазоне ±2 года пока нет
                        </Text>
                    ) : (
                        <div className={styles.carouselContainer}>
                            <button
                                className={styles.carouselArrowLeft}
                                onClick={handlePrev}
                                disabled={isPrevDisabled}
                                aria-label="Предыдущие рекомендации"
                            >
                                ←
                            </button>

                            <div className={styles.cards}>
                                {recommendations
                                    .slice(currentIndex, currentIndex + ITEMS_PER_PAGE)
                                    .map((rec) => {
                                        const recImage = rec.poster?.url
                                            ? `${STRAPI_URL}${rec.poster.url}`
                                            : cover1;

                                        return (
                                            <Card
                                                key={rec.id}
                                                image={recImage}
                                                rating={<>{rec.rating || "—"}</>}
                                                label={`${rec.duration || "?"} мин`}
                                                meta={`${rec.releaseYear || "?"} • ${rec.category?.name || "—"} • ${rec.ageLimit || "?"}+`}
                                                title={rec.title || "Без названия"}
                                                subtitle={rec.shortDescription || ""}
                                                secondaryAction={
                                                    <Button 
                                                        variant="outlined" 
                                                        textColor={isFavorite(rec.documentId) ? "red" : "primary"} 
                                                        onClick={() => toggleFavorite(rec.documentId)}
                                                    >
                                                        {isFavorite(rec.documentId) ? "В избранном" : "В избранное"}
                                                    </Button>
                                                }
                                                primaryAction={
                                                    <Link to={`/films/${rec.documentId}`}>
                                                        <Button variant="filled">
                                                            Смотреть
                                                        </Button>
                                                    </Link>
                                                }
                                            />
                                        );
                                    })}
                            </div>

                            <button
                                className={styles.carouselArrowRight}
                                onClick={handleNext}
                                disabled={isNextDisabled}
                                aria-label="Следующие рекомендации"
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </CinemaLayout>
    )
}

export default CinemaPageDetails;