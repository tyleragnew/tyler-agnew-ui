export interface Route {
  path: string;
  label: string;
  navOrder: number;
  description: string;
}

export const routes: Route[] = [
  {
    path: "/",
    label: "Home",
    navOrder: 1,
    description: "About Tyler Agnew — software engineer and musician.",
  },
  {
    path: "/blog",
    label: "Blog",
    navOrder: 2,
    description: "Writing on software, music, and things in between.",
  },
  {
    path: "/music",
    label: "Music",
    navOrder: 3,
    description: "Discography across all of Tyler's Bandcamp projects.",
  },
  {
    path: "/projects",
    label: "Projects",
    navOrder: 4,
    description: "Open source work, side projects, and tools.",
  },
  {
    path: "/records",
    label: "Records",
    navOrder: 5,
    description: "Tyler's vinyl record collection, pulled from Discogs.",
  },
];
