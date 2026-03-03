import { Navigate, type RouteObject } from "react-router";
import App from "../App";
import CinemaPage from "../App/pages/CinemaPage";
import CinemaPageDetails from "../App/pages/CinemaPageDetails";
import FavoritesPage from "@/App/pages/FavoritesPage/FavoritesPage";

export const routesConfig: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/films" replace />
      },
      {
        path: '/films',
        element: <CinemaPage />
      },
      {
        path: '/films/:documentId',
        element: <CinemaPageDetails />
      },
      {
        path: "/favorites",
        element: <FavoritesPage />
      },
    ]
  }
];