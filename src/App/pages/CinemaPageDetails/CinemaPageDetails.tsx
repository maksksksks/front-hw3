import Text from "@components/Text";
import cover1 from "@assets/Rectangle 23.png"
import styles from "./CinemaPageDetails.module.scss";
import Button from "@components/Button";
import BigCard from "./components/BigCard";
import ArrowRightIcon from "@components/icons/ArrowRightIcon";
import Card from "@components/Card";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "axios";
import qs from "qs";
import CinemaLayout from "../Layout/CinemaLayout";

const STRAPI_BASE_URL = 'https://front-school-strapi.ktsdev.ru';
const STRAPI_URL = `${STRAPI_BASE_URL}/api`

const CinemaPageDetails = () => {
    const { documentId } = useParams();
    const [film, setFilm] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [recLoading, setRecLoading] = useState<boolean>(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const ITEMS_PER_PAGE = 3;

    const fetchFilmDetails = async () => {
        try {
            const response = await axios.get(
                `${STRAPI_URL}/films/${documentId}`,
            );
            setFilm(response.data.data);
        } catch (err) {
            setError("Ошибка при загрузке фильма.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async (releaseYear: number | undefined) => {
        if (!releaseYear) {
            setRecommendations([]);
            setRecLoading(false);
            return;
        }

        try {
            setRecLoading(true);

            const minYear = releaseYear - 2;
            const maxYear = releaseYear + 2;

            const query = qs.stringify(
                {
                    populate: ["poster"],
                    filters: {
                        releaseYear: {
                            $gte: minYear,
                            $lte: maxYear
                        },
                        documentId: {
                            $ne: documentId
                        }
                    },
                    pagination: {
                        page: 1,
                        pageSize: 6
                    },
                },
                { encodeValuesOnly: true }
            );

            const { data } = await axios.get(`${STRAPI_URL}/films?${query}`);

            setRecommendations(data.data || []);
        } catch (err) {
            console.error("Ошибка загрузки рекомендаций", err);
            setRecommendations([]);
        } finally {
            setRecLoading(false);
        }
    };

    useEffect(() => {
        fetchFilmDetails();
    }, [documentId]);

    useEffect(() => {
        if (film?.releaseYear) {
            fetchRecommendations(film.releaseYear);
        } else {
            setRecLoading(false);
        }
    }, [film?.releaseYear, documentId]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>{error}</div>;
    if (!film) return <div>Фильм не найден</div>;

    const { title, description, releaseYear, duration, rating, ageLimit, poster, genre } = film;
    const imageUrl = poster?.url ? `${STRAPI_BASE_URL}${poster.url}` : cover1;

    return (
        <CinemaLayout>
            <div className={styles.content}>
                <Link to={`/films`}>
                    <div className={styles.back}>
                        <ArrowRightIcon width={32} height={32} />
                        <Text
                            color="primary"
                            view="p-20"
                            tag="div"
                            className="text-back"
                        >
                            Назад
                        </Text>
                    </div>
                </Link>

                <BigCard
                    image={imageUrl}
                    title={title}
                    description={description}
                    year={releaseYear}
                    genre={genre}
                    age={ageLimit}
                    duration={`${duration} мин`}
                    rating={rating}
                />


                <div className={styles.recommendations}>
                    <Text color="primary" view="p-32" weight="bold" tag="h1">
                        Рекомендации
                    </Text>

                    {recLoading ? (
                        <div>Загрузка рекомендаций...</div>
                    ) : recommendations.length === 0 ? (
                        <Text color="secondary" view="p-20">
                            Рекомендаций в диапазоне ±2 года пока нет
                        </Text>
                    ) : (
                        <div className={styles.carouselContainer}>
                            <button
                                className={styles.carouselArrowLeft}
                                onClick={() => setCurrentIndex(prev => Math.max(0, prev - ITEMS_PER_PAGE))}
                                disabled={currentIndex === 0}
                                aria-label="Предыдущие рекомендации"
                            >
                                ←
                            </button>

                            <div className={styles.cards}>
                                {recommendations
                                    .slice(currentIndex, currentIndex + ITEMS_PER_PAGE)
                                    .map((rec) => {
                                        const recImage = rec.poster?.url
                                            ? `${STRAPI_BASE_URL}${rec.poster.url}`
                                            : cover1;

                                        return (
                                            <Card
                                                key={rec.id}
                                                image={recImage}
                                                rating={<>{rec.rating || "—"}</>}
                                                label={`${rec.duration || "?"} мин`}
                                                meta={`${rec.releaseYear || "?"} • ${rec.genre || "—"} • ${rec.ageLimit || "?"}+`}
                                                title={rec.title || "Без названия"}
                                                subtitle={rec.shortDescription || rec.description?.slice(0, 120) || ""}
                                                secondaryAction={
                                                    <Button variant="outlined" textColor="red" className={styles.cardButton}>
                                                        В избранное
                                                    </Button>
                                                }
                                                primaryAction={
                                                    <Link to={`/films/${rec.documentId}`}>
                                                        <Button variant="filled" className={styles.cardButton}>
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
                                onClick={() => setCurrentIndex(prev => prev + ITEMS_PER_PAGE)}
                                disabled={currentIndex + ITEMS_PER_PAGE >= recommendations.length}
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