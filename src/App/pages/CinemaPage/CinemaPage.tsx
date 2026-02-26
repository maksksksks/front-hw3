import Text from "@components/Text";
import cover1 from "@assets/Rectangle 25.png"
import styles from "./CinemaPage.module.scss";
import Button from "@components/Button";
import Card from "@components/Card";
import Input from "./components/Input";
import MultiDropdown, { type Option } from "./components/MultiDropdown";
import { useEffect, useState } from "react";
import axios from "axios";
import qs from "qs";
import { Link } from "react-router";
import CinemaLayout from "../Layout/CinemaLayout";

function onInput(s: string) {
    console.log(s);
}

const STRAPI_BASE_URL = 'https://front-school-strapi.ktsdev.ru';
const STRAPI_URL = `${STRAPI_BASE_URL}/api`

const options: Option[] = [
    { key: 'fantasy', value: 'Фэнтези' },
    { key: 'drama', value: 'Драма' },
    { key: 'comedy', value: 'Комедия' },
    { key: 'thriller', value: 'Триллер' },
];

const CinemaPage = () => {
    const [films, setFilms] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedGenres, setSelectedGenres] = useState<Option[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(9);
    const [pageCount, setPageCount] = useState(1);

    const fetchFilms = async (page: number = 1) => {
        try {
            setLoading(true);

            const query = qs.stringify(
                {
                    populate: ["category", "poster", "gallery"],
                    pagination: {
                        page,
                        pageSize,
                    },
                },
                { encodeValuesOnly: true }
            );

            const { data } = await axios.get(
                `${STRAPI_URL}/films?${query}`
            );

            setFilms(data.data);
            setTotal(data.meta.pagination.total);
            setPageCount(data.meta.pagination.pageCount || 1);
            setCurrentPage(data.meta.pagination.page);

        } catch (error) {
            console.error("Ошибка загрузки фильмов", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilms(currentPage);
    }, [currentPage]);

    return (
        <CinemaLayout>
            <div className={styles.content}>
                <div className={styles.texts}>
                    <Text tag="p" className={styles.title}>
                        Cinema
                    </Text>

                    <Text tag="p" className={styles.subtitle}>
                        Подборка для вечера уже здесь: фильмы, сериалы и новинки.
                        <br />
                        Найди что посмотреть — за пару секунд.
                    </Text>
                </div>

                <div className={styles.filters}>
                    <div className={styles.search}>
                        <Input
                            onChange={onInput}
                            value=""
                            placeholder="Искать фильм"
                            className={styles.searchInput}
                        />
                        <Button className={styles.searchButton}>
                            Найти
                        </Button>
                    </div>

                    <MultiDropdown
                        className={styles.MultiDropdownFilters}
                        options={options}
                        value={selectedGenres}
                        onChange={setSelectedGenres}
                        getTitle={(value) =>
                            value.length === 0
                                ? 'Фильтры'
                                : value.map(v => v.value).join(', ')
                        }
                    />
                    <div className={styles.filmsTitle}>
                        <Text
                            color="primary"
                            view="p-32"
                            weight="bold"
                            tag="h1"
                        >
                            Все фильмы
                        </Text>
                        <Text
                            color="red"
                            view="p-20-mono"
                            weight="bold"
                        >
                            {total}
                        </Text>
                    </div>
                </div>

                <div className={styles.recommendations}>
                    <div className={styles.cards}>
                        {loading && <div>Загрузка...</div>}


                        {films.map((film) => {
                            const imageUrl = cover1;
                            console.log(JSON.stringify(films[0], null, 2));

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
                                        <Button variant="outlined" textColor="red" className="cardButton">
                                            В избранное
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
                </div>
            </div>

            <div className={styles.footer}>
                {!loading && films.length > 0 && pageCount > 1 && (
                    <div className={styles.paginator}>
                        <Button
                            variant="outlined"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                            Предыдущая
                        </Button>

                        <div className={styles.pagesButtons}>
                            {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    variant={page === currentPage ? "filled" : "outlined"}
                                    onClick={() => setCurrentPage(page)}
                                    style={{ minWidth: "48px" }}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outlined"
                            disabled={currentPage === pageCount}
                            onClick={() => setCurrentPage(p => p + 1)}
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
