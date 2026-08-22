/* The map library, served from our own /public/img/maps-library.

   These were previously hotlinked from the old WordPress site at
   deeprealestate.in/wp-content/uploads/. That domain now serves this very
   SPA, and its catch-all returns index.html for every path — so each <img>
   was fetching a 637-byte HTML document with a 200 status instead of a JPEG,
   and the whole page rendered blank with nothing in the console to explain it.

   The originals came from admin/assets/maps (the pre-WordPress site), resized
   into two tiers: `thumb` is 600w for the grid, `full` is 2000w for the
   lightbox — legible enough to read plot numbers without shipping the 2MB
   originals.

   Sohna Masterplan was recovered from the Wayback Machine — it is the only
   one of the missing maps the crawler ever captured.

   Fifteen maps from the old page have no surviving source and are omitted:
   DLF 5, Alameda and Garden City; Sushant LOK 4; Vatika 1-5; and Anant RAJ,
   Bptp Amstoria, Emerald Floors, Raheja, Palam Vihar, Ireo City.
   Add the file to both tiers and the entry here to bring one back. */

export type MapItem = { name: string; thumb: string; full: string };
export type MapSection = { title: string; maps: MapItem[] };

export const mapSections: MapSection[] = [
  {
    "title": "Master Plans",
    "maps": [
      {
        "name": "Masterplan",
        "thumb": "/img/maps-library/grid/master-plans-masterplan.jpg",
        "full": "/img/maps-library/full/master-plans-masterplan.jpg"
      },
      {
        "name": "Manesar",
        "thumb": "/img/maps-library/grid/master-plans-manesar.jpg",
        "full": "/img/maps-library/full/master-plans-manesar.jpg"
      },
      {
        "name": "Dharuhera",
        "thumb": "/img/maps-library/grid/master-plans-dharuhera.jpg",
        "full": "/img/maps-library/full/master-plans-dharuhera.jpg"
      },
      {
        "name": "Sohna Masterplan",
        "thumb": "/img/maps-library/grid/master-plans-sohna-masterplan.jpg",
        "full": "/img/maps-library/full/master-plans-sohna-masterplan.jpg"
      }
    ]
  },
  {
    "title": "DLF",
    "maps": [
      {
        "name": "DLF 1",
        "thumb": "/img/maps-library/grid/dlf-dlf-1.jpg",
        "full": "/img/maps-library/full/dlf-dlf-1.jpg"
      },
      {
        "name": "DLF 2",
        "thumb": "/img/maps-library/grid/dlf-dlf-2.jpg",
        "full": "/img/maps-library/full/dlf-dlf-2.jpg"
      },
      {
        "name": "DLF 3",
        "thumb": "/img/maps-library/grid/dlf-dlf-3.jpg",
        "full": "/img/maps-library/full/dlf-dlf-3.jpg"
      },
      {
        "name": "DLF 4",
        "thumb": "/img/maps-library/grid/dlf-dlf-4.jpg",
        "full": "/img/maps-library/full/dlf-dlf-4.jpg"
      }
    ]
  },
  {
    "title": "HUDA Sectors",
    "maps": [
      {
        "name": "Sector 4 & 7",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-4-and-7.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-4-and-7.jpg"
      },
      {
        "name": "Sector 5",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-5.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-5.jpg"
      },
      {
        "name": "Sector 7 Ext.",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-7-ext.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-7-ext.jpg"
      },
      {
        "name": "Sector 7",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-7.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-7.jpg"
      },
      {
        "name": "Sector 9",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-9.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-9.jpg"
      },
      {
        "name": "Sector 9A",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-9a.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-9a.jpg"
      },
      {
        "name": "Sector 10",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-10.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-10.jpg"
      },
      {
        "name": "Sector 10A",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-10a.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-10a.jpg"
      },
      {
        "name": "Sector 12A",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-12a.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-12a.jpg"
      },
      {
        "name": "Sector 14",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-14.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-14.jpg"
      },
      {
        "name": "Sector 15",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-15.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-15.jpg"
      },
      {
        "name": "Sector 15",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-15-2.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-15-2.jpg"
      },
      {
        "name": "Sector 17",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-17.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-17.jpg"
      },
      {
        "name": "Sector 21",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-21.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-21.jpg"
      },
      {
        "name": "Sector 22",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-22.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-22.jpg"
      },
      {
        "name": "Sector 23",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-23.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-23.jpg"
      },
      {
        "name": "Sector 23A",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-23a.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-23a.jpg"
      },
      {
        "name": "Sector 27 & 28",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-27-and-28.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-27-and-28.jpg"
      },
      {
        "name": "Sector 29",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-29.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-29.jpg"
      },
      {
        "name": "Sector 31 & 32a",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-31-and-32a.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-31-and-32a.jpg"
      },
      {
        "name": "Sector 31",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-31.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-31.jpg"
      },
      {
        "name": "Sector 32,33,34",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-32-33-34.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-32-33-34.jpg"
      },
      {
        "name": "Sector 34",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-34.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-34.jpg"
      },
      {
        "name": "Sector 38",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-38.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-38.jpg"
      },
      {
        "name": "Sector 39",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-39.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-39.jpg"
      },
      {
        "name": "Sector 40",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-40.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-40.jpg"
      },
      {
        "name": "Sector 43",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-43.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-43.jpg"
      },
      {
        "name": "Sector 44",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-44.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-44.jpg"
      },
      {
        "name": "Sector 45",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-45.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-45.jpg"
      },
      {
        "name": "Sector 46",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-46.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-46.jpg"
      },
      {
        "name": "Sector 47",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-47.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-47.jpg"
      },
      {
        "name": "Sector 51",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-51.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-51.jpg"
      },
      {
        "name": "Sector 52",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-52.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-52.jpg"
      },
      {
        "name": "Sector 57",
        "thumb": "/img/maps-library/grid/huda-sectors-sector-57.jpg",
        "full": "/img/maps-library/full/huda-sectors-sector-57.jpg"
      }
    ]
  },
  {
    "title": "Sushant Lok",
    "maps": [
      {
        "name": "Sushant LOK 1",
        "thumb": "/img/maps-library/grid/sushant-lok-sushant-lok-1.jpg",
        "full": "/img/maps-library/full/sushant-lok-sushant-lok-1.jpg"
      },
      {
        "name": "Sushant LOK 2",
        "thumb": "/img/maps-library/grid/sushant-lok-sushant-lok-2.jpg",
        "full": "/img/maps-library/full/sushant-lok-sushant-lok-2.jpg"
      },
      {
        "name": "Sushant LOK 3",
        "thumb": "/img/maps-library/grid/sushant-lok-sushant-lok-3.jpg",
        "full": "/img/maps-library/full/sushant-lok-sushant-lok-3.jpg"
      }
    ]
  },
  {
    "title": "South City",
    "maps": [
      {
        "name": "South City 2",
        "thumb": "/img/maps-library/grid/south-city-south-city-2.jpg",
        "full": "/img/maps-library/full/south-city-south-city-2.jpg"
      },
      {
        "name": "South City 1",
        "thumb": "/img/maps-library/grid/south-city-south-city-1.jpg",
        "full": "/img/maps-library/full/south-city-south-city-1.jpg"
      }
    ]
  },
  {
    "title": "Builder Projects",
    "maps": [
      {
        "name": "Greenwood City",
        "thumb": "/img/maps-library/grid/builder-projects-greenwood-city.jpg",
        "full": "/img/maps-library/full/builder-projects-greenwood-city.jpg"
      },
      {
        "name": "Malibu Town",
        "thumb": "/img/maps-library/grid/builder-projects-malibu-town.jpg",
        "full": "/img/maps-library/full/builder-projects-malibu-town.jpg"
      },
      {
        "name": "Mayfield Garden",
        "thumb": "/img/maps-library/grid/builder-projects-mayfield-garden.jpg",
        "full": "/img/maps-library/full/builder-projects-mayfield-garden.jpg"
      },
      {
        "name": "Nirvana",
        "thumb": "/img/maps-library/grid/builder-projects-nirvana.jpg",
        "full": "/img/maps-library/full/builder-projects-nirvana.jpg"
      },
      {
        "name": "Rosewood City",
        "thumb": "/img/maps-library/grid/builder-projects-rosewood-city.jpg",
        "full": "/img/maps-library/full/builder-projects-rosewood-city.jpg"
      },
      {
        "name": "Saraswati Vihar",
        "thumb": "/img/maps-library/grid/builder-projects-saraswati-vihar.jpg",
        "full": "/img/maps-library/full/builder-projects-saraswati-vihar.jpg"
      },
      {
        "name": "Suncity",
        "thumb": "/img/maps-library/grid/builder-projects-suncity.jpg",
        "full": "/img/maps-library/full/builder-projects-suncity.jpg"
      },
      {
        "name": "Uppal Southend",
        "thumb": "/img/maps-library/grid/builder-projects-uppal-southend.jpg",
        "full": "/img/maps-library/full/builder-projects-uppal-southend.jpg"
      },
      {
        "name": "Vipul World",
        "thumb": "/img/maps-library/grid/builder-projects-vipul-world.jpg",
        "full": "/img/maps-library/full/builder-projects-vipul-world.jpg"
      }
    ]
  },
  {
    "title": "Udyog Vihar",
    "maps": [
      {
        "name": "Pace City 1",
        "thumb": "/img/maps-library/grid/udyog-vihar-pace-city-1.jpg",
        "full": "/img/maps-library/full/udyog-vihar-pace-city-1.jpg"
      },
      {
        "name": "Pace City 2",
        "thumb": "/img/maps-library/grid/udyog-vihar-pace-city-2.jpg",
        "full": "/img/maps-library/full/udyog-vihar-pace-city-2.jpg"
      },
      {
        "name": "Udyog Vihar",
        "thumb": "/img/maps-library/grid/udyog-vihar-udyog-vihar.jpg",
        "full": "/img/maps-library/full/udyog-vihar-udyog-vihar.jpg"
      }
    ]
  }
];
