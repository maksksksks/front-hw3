import type { ReactNode } from 'react';
import BookmarkIcon from "../../../components/icons/BookmarkIcon";
import UserIcon from "../../../components/icons/UserIcon";
import logo from "../../../components/assets/logo.png";
import Button from "../../../components/Button";
import styles from "./CinemaLayout.module.scss";

interface CinemaLayoutProps {
    children: ReactNode;
}

export default function CinemaLayout({ children }: CinemaLayoutProps) {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <img src={logo} alt="Logo" />
                <div className={styles.nav}>
                    <Button variant="underline">Фильмы</Button>
                    <Button variant="underline">Новинки</Button>
                    <Button variant="underline">Подборки</Button>
                </div>
                <div className={styles.icons}>
                    <BookmarkIcon width={30} height={30} />
                    <UserIcon width={30} height={30} />
                </div>
            </div>

            <div className={styles.main}>
                {children}
            </div>

            <div className={styles.footer}>
                footer
            </div>
        </div>
    );
}