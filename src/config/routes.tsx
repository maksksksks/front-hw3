import type { RouteObject } from "react-router";
import App from "../App";
import CinemaPage from "../App/pages/CinemaPage";
import CinemaPageDetails from "../App/pages/CinemaPageDetails";

export const routesConfig: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/films',
        element: <CinemaPage />
      },
      {
        path: '/films/:documentId',
        element: <CinemaPageDetails />
      }
    ]
  }
];